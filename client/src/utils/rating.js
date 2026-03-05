export const getRatingLabel = (rating) => {
    switch (rating) {
        case 1:
            return 'Poor';
        case 2:
            return 'Below Average';
        case 3:
            return 'Good';
        case 4:
            return 'Very Good';
        case 5:
            return 'Excellent';
        default:
            return '';
    }
};
