import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import IssueTrackingTimeline from '../../components/dashboard/IssueTrackingTimeline';
import { ArrowLeft } from 'lucide-react';

const IssueDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white border-b p-6 shadow-sm">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Issue Details & Tracking</h1>
          <p className="text-gray-600 text-sm mt-1">View complete timeline, actions, expenses, and completion status</p>
        </div>

        {/* Timeline */}
        <div className="p-6">
          <IssueTrackingTimeline issueId={id} />
        </div>
      </div>
    </div>
  );
};

export default IssueDetailPage;
