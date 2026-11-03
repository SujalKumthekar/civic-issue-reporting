export const MOCK_REPORTS = [
    {
        id: 'CIV-A829X1',
        title: 'Large Pothole on Main Street',
        type: 'Road & Infrastructure',
        date: '2026-03-10T10:30:00Z',
        location: 'Sector 4, Main Road, Pune',
        description: 'There is a massive pothole causing severe traffic slowdowns and potential vehicle damage right in the middle lane. Needs immediate filling.',
        status: 'PENDING_APPROVAL',
        severity: 'High',
        citizenId: 'USR-782',
        assignedNagarpalika: 'Ward 04',
        updates: [
            { timestamp: '2026-03-10T10:30:00Z', status: 'SUBMITTED', note: 'Report submitted by citizen.' },
            { timestamp: '2026-03-10T14:15:00Z', status: 'IN_PROGRESS', note: 'Assigned to Ward 04 Public Works team.' },
            { timestamp: '2026-03-11T09:00:00Z', status: 'PENDING_APPROVAL', note: 'Pothole filled with cold mix. Awaiting final District clearance.' }
        ],
        resolutionProof: 'https://images.unsplash.com/photo-1544627250-9a4f475f3a97?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'CIV-B748Y2',
        title: 'Overflowing Garbage Bin',
        type: 'Waste Management',
        date: '2026-03-08T08:15:00Z',
        location: 'Park Street Market, Pune',
        description: 'The community garbage bin has not been emptied for the past 4 days. It is overflowing and causing a severe health hazard.',
        status: 'SUBMITTED',
        severity: 'Medium',
        citizenId: 'USR-119',
        assignedNagarpalika: 'Ward 02',
        updates: [
            { timestamp: '2026-03-08T08:15:00Z', status: 'SUBMITTED', note: 'Report submitted by citizen.' }
        ],
        resolutionProof: null
    },
    {
        id: 'CIV-C192Z3',
        title: 'Broken Street Light',
        type: 'Lighting & Electronics',
        date: '2026-03-02T19:45:00Z',
        location: 'Avenue Road, Lane 2, Pune',
        description: 'Street light number 45 has been flickering and is now completely dead. The area is very dark and unsafe at night.',
        status: 'APPROVED',
        severity: 'Low',
        citizenId: 'USR-344',
        assignedNagarpalika: 'Ward 04',
        updates: [
            { timestamp: '2026-03-02T19:45:00Z', status: 'SUBMITTED', note: 'Report submitted by citizen.' },
            { timestamp: '2026-03-03T10:00:00Z', status: 'IN_PROGRESS', note: 'Electrician dispatched.' },
            { timestamp: '2026-03-04T16:30:00Z', status: 'APPROVED', note: 'Local body replaced bulb. Issue closed.' }
        ],
        resolutionProof: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80'
    },
    {
        id: 'CIV-D884W5',
        title: 'Open Manhole',
        type: 'Road & Infrastructure',
        date: '2026-03-11T07:20:00Z',
        location: 'MG Road Junction, Pune',
        description: 'Manhole cover is missing entirely. Extremely dangerous for pedestrians and two-wheelers.',
        status: 'IN_PROGRESS',
        severity: 'Critical',
        citizenId: 'USR-901',
        assignedNagarpalika: 'Ward 01',
        updates: [
            { timestamp: '2026-03-11T07:20:00Z', status: 'SUBMITTED', note: 'Report submitted by citizen.' },
            { timestamp: '2026-03-11T08:05:00Z', status: 'IN_PROGRESS', note: 'Emergency barricades placed. Heavy cover replacement ordered.' }
        ],
        resolutionProof: null
    },
    {
        id: 'CIV-E556Q9',
        title: 'Collapsed Retaining Wall',
        type: 'Public Property Damage',
        date: '2026-03-11T09:10:00Z',
        location: 'Riverbed Road, Pune',
        description: 'A 20-meter section of the retaining wall has collapsed after heavy rains. Major repair work needed.',
        status: 'PENDING_FUNDS',
        severity: 'Critical',
        citizenId: 'USR-224',
        assignedNagarpalika: 'Ward 04',
        updates: [
            { timestamp: '2026-03-11T09:10:00Z', status: 'SUBMITTED', note: 'Report submitted by citizen.' },
            { timestamp: '2026-03-11T10:00:00Z', status: 'IN_PROGRESS', note: 'Area cordoned off.' },
            { timestamp: '2026-03-11T11:30:00Z', status: 'PENDING_FUNDS', note: 'Initial assessment shows ₹15,00,000 required for rebuilding. Escalated to District Main for budget approval.' }
        ],
        resolutionProof: null
    },
    {
        id: 'CIV-F291L0',
        title: 'Unauthorized Construction on Footpath',
        type: 'Illegal Activity',
        date: '2026-03-11T12:00:00Z',
        location: 'FC Road, Near Gate 2, Pune',
        description: 'A shop owner is extending their storefront onto the walking path, blocking pedestrian movement completely.',
        status: 'SUBMITTED',
        severity: 'High',
        citizenId: 'USR-882',
        assignedNagarpalika: 'Ward 04',
        updates: [
            { timestamp: '2026-03-11T12:00:00Z', status: 'SUBMITTED', note: 'Report submitted by citizen.' }
        ],
        resolutionProof: null
    }
];

export const getStatusBadgeColor = (status) => {
    switch (status) {
        case 'SUBMITTED': return 'bg-slate-100 text-slate-700 border-slate-200';
        case 'IN_PROGRESS': return 'bg-orange-50 text-orange-700 border-orange-200';
        case 'PENDING_FUNDS': return 'bg-red-50 text-red-700 border-red-200';
        case 'PENDING_APPROVAL': return 'bg-purple-50 text-purple-700 border-purple-200';
        case 'APPROVED': return 'bg-green-50 text-green-700 border-green-200';
        default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
};

export const getStatusLabel = (status) => {
    switch (status) {
        case 'SUBMITTED': return 'New Request';
        case 'IN_PROGRESS': return 'In Progress';
        case 'PENDING_FUNDS': return 'Funds Required';
        case 'PENDING_APPROVAL': return 'Awaiting Auth';
        case 'APPROVED': return 'Resolved';
        default: return status;
    }
};
