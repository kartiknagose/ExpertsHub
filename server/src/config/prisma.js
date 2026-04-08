const { PrismaClient } = require('@prisma/client');

const isDev = process.env.NODE_ENV === 'development';

const hasDeletedAtFilter = (where) => {
  if (!where || typeof where !== 'object') {
    return false;
  }

  if (Object.prototype.hasOwnProperty.call(where, 'deletedAt')) {
    return true;
  }

  return ['AND', 'OR', 'NOT'].some((key) => {
    const value = where[key];
    if (!value) return false;
    if (Array.isArray(value)) {
      return value.some((item) => hasDeletedAtFilter(item));
    }
    return hasDeletedAtFilter(value);
  });
};

const injectActiveUserFilter = (args = {}) => {
  const nextArgs = { ...args };
  const where = nextArgs.where && typeof nextArgs.where === 'object' ? { ...nextArgs.where } : {};

  if (!hasDeletedAtFilter(where)) {
    where.deletedAt = null;
  }

  nextArgs.where = where;
  return nextArgs;
};

const prisma = new PrismaClient({
  log: isDev
    ? [
        { level: 'query', emit: 'event' },
        { level: 'error', emit: 'stdout' },
        { level: 'warn', emit: 'stdout' },
      ]
    : ['error', 'warn'],
});

prisma.$use(async (params, next) => {
  if (params.model !== 'User') {
    return next(params);
  }

  if (params.action === 'findUnique') {
    params.action = 'findFirst';
    params.args = injectActiveUserFilter(params.args);
  } else if (params.action === 'findUniqueOrThrow') {
    params.action = 'findFirstOrThrow';
    params.args = injectActiveUserFilter(params.args);
  } else if (['findFirst', 'findFirstOrThrow', 'findMany', 'count', 'aggregate', 'groupBy'].includes(params.action)) {
    params.args = injectActiveUserFilter(params.args);
  } else if (params.action === 'delete') {
    params.action = 'update';
    params.args = {
      ...params.args,
      data: {
        ...(params.args?.data || {}),
        deletedAt: new Date(),
        isActive: false,
      },
    };
  } else if (params.action === 'deleteMany') {
    params.action = 'updateMany';
    params.args = {
      ...params.args,
      data: {
        ...(params.args?.data || {}),
        deletedAt: new Date(),
        isActive: false,
      },
    };
  }

  return next(params);
});

// Log slow queries in development
if (isDev) {
  prisma.$on('query', (e) => {
    const slowThreshold = 100; // ms
    if (e.duration > slowThreshold) {
      const params = e.params ? ` [params: ${e.params}]` : '';
      console.warn(`[SLOW_QUERY] ${e.duration}ms: ${e.query}${params}`);
    }
  });
}

module.exports = prisma;