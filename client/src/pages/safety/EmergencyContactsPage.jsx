/**
 * EmergencyContactsPage — Dedicated Emergency Contacts Settings
 *
 * Accessible from Profile → Safety Settings or directly at /safety/contacts
 * Allows users to manage emergency contacts who will be SMS-notified during an SOS.
 */

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    ShieldAlert, UserPlus, Trash2, Phone, User, Heart,
    ArrowLeft, AlertTriangle, CheckCircle, Info, Siren
} from 'lucide-react';
import { MainLayout } from '../../components/layout/MainLayout';
import { Card, CardHeader, CardTitle, CardDescription, Button, Input, PageHeader, Badge } from '../../components/common';
import { getEmergencyContacts, addEmergencyContact, deleteEmergencyContact } from '../../api/safety';
import { getPageLayout } from '../../constants/layout';
import { toast } from 'sonner';
import { queryKeys } from '../../utils/queryKeys';

const RELATIONS = ['Spouse', 'Parent', 'Sibling', 'Friend', 'Colleague', 'Child', 'Other'];

const MAX_CONTACTS = 5;

export function EmergencyContactsPage() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ name: '', phone: '', relation: '' });
    const [errors, setErrors] = useState({});

    const { data, isLoading } = useQuery({
        queryKey: queryKeys.safety.emergencyContacts(),
        queryFn: getEmergencyContacts,
    });
    const contacts = data?.contacts || [];

    const addMutation = useMutation({
        mutationFn: addEmergencyContact,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.safety.emergencyContacts() });
            setForm({ name: '', phone: '', relation: '' });
            setShowForm(false);
            toast.success('Emergency contact added!');
        },
        onError: (err) => toast.error(err.response?.data?.error || 'Failed to add contact'),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteEmergencyContact,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.safety.emergencyContacts() });
            toast.success('Contact removed');
        },
        onError: () => toast.error('Failed to remove contact'),
    });

    const validate = () => {
        const e = {};
        if (!form.name.trim()) e.name = 'Name is required';
        if (!form.phone.trim()) e.phone = 'Phone number is required';
        else if (!/^[6-9]\d{9}$/.test(form.phone.replace(/\s/g, '')))
            e.phone = 'Enter a valid 10-digit Indian mobile number';
        if (!form.relation) e.relation = 'Relation is required';
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validate()) addMutation.mutate(form);
    };

    const cardBase = 'rounded-2xl border transition-all duration-200 bg-white border-gray-100 shadow-sm dark:bg-dark-800 dark:border-dark-700 dark:shadow-none';

    return (
        <MainLayout>
            <div className={getPageLayout('default')}>
                <PageHeader
                    title="Emergency Contacts"
                    subtitle="People who will be instantly notified via SMS when you trigger an SOS alert."
                    action={
                        <Button variant="ghost" icon={ArrowLeft} onClick={() => navigate(-1)}>
                            Back
                        </Button>
                    }
                />

                {/* How it works */}
                <div className="p-5 rounded-2xl mb-6 flex gap-4 items-start bg-red-50 border border-red-100 dark:bg-red-950/30 dark:border-red-900/40">
                    <div className="w-10 h-10 rounded-xl bg-red-600 flex items-center justify-center shrink-0">
                        <Siren size={20} className="text-white" />
                    </div>
                    <div>
                        <h3 className="font-bold text-sm mb-1 text-red-800 dark:text-red-300">
                            How SOS Alerts Work
                        </h3>
                        <p className="text-xs leading-relaxed text-red-600 dark:text-red-400">
                            During an active booking, a floating <strong>SOS button</strong> appears on every page.
                            Hold it for 3 seconds to trigger an emergency alert. Your contacts will receive an
                            SMS with your GPS location and booking details — <strong>completely free</strong> via carrier gateway.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* ── Contacts List ── */}
                    <div className="lg:col-span-2 space-y-4">
                        <div className="flex items-center justify-between">
                            <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                                Your Contacts ({contacts.length}/{MAX_CONTACTS})
                            </h2>
                            {!showForm && contacts.length < MAX_CONTACTS && (
                                <Button
                                    size="sm"
                                    icon={UserPlus}
                                    onClick={() => setShowForm(true)}
                                    className="bg-brand-600 text-white hover:bg-brand-700"
                                >
                                    Add Contact
                                </Button>
                            )}
                        </div>

                        {/* Add form */}
                        {showForm && (
                            <div className="p-5 rounded-2xl border bg-white border-gray-200 shadow-sm dark:bg-dark-800 dark:border-dark-700 dark:shadow-none">
                                <h3 className="font-bold mb-4 text-gray-900 dark:text-white">
                                    Add New Contact
                                </h3>
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest mb-1.5 text-gray-500 dark:text-gray-400">
                                                Full Name *
                                            </label>
                                            <Input
                                                placeholder="e.g. Rahul Sharma"
                                                value={form.name}
                                                onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                                                className={errors.name ? 'border-red-500' : ''}
                                            />
                                            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
                                        </div>
                                        <div>
                                            <label className="block text-xs font-black uppercase tracking-widest mb-1.5 text-gray-500 dark:text-gray-400">
                                                Mobile Number *
                                            </label>
                                            <Input
                                                placeholder="e.g. 9876543210"
                                                value={form.phone}
                                                onChange={(e) => setForm(f => ({ ...f, phone: e.target.value }))}
                                                maxLength={10}
                                                className={errors.phone ? 'border-red-500' : ''}
                                            />
                                            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-black uppercase tracking-widest mb-1.5 text-gray-500 dark:text-gray-400">
                                            Relationship *
                                        </label>
                                        <div className="flex flex-wrap gap-2">
                                            {RELATIONS.map((r) => (
                                                <button
                                                    type="button"
                                                    key={r}
                                                    onClick={() => setForm(f => ({ ...f, relation: r }))}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border
                                                        ${form.relation === r
                                                            ? 'bg-brand-600 text-white border-brand-600'
                                                            : 'border-gray-200 text-gray-600 hover:border-brand-400 hover:text-brand-600 dark:border-dark-600 dark:text-gray-400 dark:hover:border-brand-500 dark:hover:text-brand-400'
                                                        }`}
                                                >
                                                    {r}
                                                </button>
                                            ))}
                                        </div>
                                        {errors.relation && <p className="text-red-500 text-xs mt-1">{errors.relation}</p>}
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <Button
                                            type="submit"
                                            loading={addMutation.isPending}
                                            className="bg-brand-600 text-white hover:bg-brand-700 px-6"
                                        >
                                            Save Contact
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={() => { setShowForm(false); setForm({ name: '', phone: '', relation: '' }); setErrors({}); }}
                                        >
                                            Cancel
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        )}

                        {/* Loading skeleton */}
                        {isLoading && (
                            <div className="space-y-3">
                                {[1, 2].map(i => (
                                    <div key={i} className="h-20 rounded-2xl animate-pulse bg-gray-100 dark:bg-dark-700" />
                                ))}
                            </div>
                        )}

                        {/* Contact cards */}
                        {!isLoading && contacts.length === 0 && !showForm && (
                            <div className="text-center py-16 rounded-2xl border-2 border-dashed border-gray-200 dark:border-dark-600">
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-red-100 dark:bg-red-900/20 flex items-center justify-center">
                                    <ShieldAlert size={28} className="text-red-500" />
                                </div>
                                <h3 className="text-lg font-bold mb-2 text-gray-900 dark:text-white">
                                    No emergency contacts yet
                                </h3>
                                <p className="text-sm mb-6 text-gray-500 dark:text-gray-400">
                                    Add at least one person to be notified in an emergency.
                                </p>
                                <Button
                                    icon={UserPlus}
                                    onClick={() => setShowForm(true)}
                                    className="bg-brand-600 text-white hover:bg-brand-700 mx-auto"
                                >
                                    Add First Contact
                                </Button>
                            </div>
                        )}

                        {contacts.map((contact) => (
                            <div
                                key={contact.id}
                                className={`flex items-center justify-between p-5 ${cardBase}`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                                        <User size={22} />
                                    </div>
                                    <div>
                                        <p className="font-bold text-gray-900 dark:text-white">
                                            {contact.name}
                                        </p>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <Phone size={12} className="text-gray-400" />
                                            <span className="text-sm text-gray-500">{contact.phone}</span>
                                            <Badge variant="secondary" className="text-xs">{contact.relation}</Badge>
                                        </div>
                                    </div>
                                </div>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    icon={Trash2}
                                    className="text-error-500 hover:bg-error-50 dark:hover:bg-error-900/20"
                                    loading={deleteMutation.isPending && deleteMutation.variables === contact.id}
                                    onClick={() => deleteMutation.mutate(contact.id)}
                                >
                                    Remove
                                </Button>
                            </div>
                        ))}
                    </div>

                    {/* ── Sidebar: Tips ── */}
                    <div className="space-y-5">
                        <div className="p-5 rounded-2xl bg-white border border-gray-100 shadow-sm dark:bg-dark-800 dark:border-dark-700 dark:shadow-none">
                            <h3 className="font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white">
                                <Info size={16} className="text-brand-500" />
                                SMS Notification
                            </h3>
                            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
                                <li className="flex gap-2">
                                    <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                                    SMS sent instantly via free carrier gateway
                                </li>
                                <li className="flex gap-2">
                                    <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                                    Works with Jio, Airtel, Vi, BSNL numbers
                                </li>
                                <li className="flex gap-2">
                                    <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                                    GPS location included in the message
                                </li>
                                <li className="flex gap-2">
                                    <CheckCircle size={14} className="text-green-500 mt-0.5 shrink-0" />
                                    Admin team notified in real-time
                                </li>
                                <li className="flex gap-2">
                                    <AlertTriangle size={14} className="text-yellow-500 mt-0.5 shrink-0" />
                                    SMS delivery depends on carrier gateway availability
                                </li>
                            </ul>
                        </div>

                        <div className="p-5 rounded-2xl bg-brand-50 border border-brand-100 dark:bg-brand-900/10 dark:border-brand-800">
                            <h3 className="font-bold mb-2 flex items-center gap-2 text-brand-800 dark:text-brand-300">
                                <Heart size={16} />
                                Best Practices
                            </h3>
                            <ul className="space-y-2 text-xs text-brand-700 dark:text-brand-400">
                                <li>• Add 2-3 trusted contacts for redundancy</li>
                                <li>• Make sure your contacts know they might get SOS texts</li>
                                <li>• Update contacts when numbers change</li>
                                <li>• Enable location permissions in your browser</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}
