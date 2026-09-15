import React, { useEffect, useState } from 'react';
import PageContainer from '../components/layout/PageContainer';
import Card from '../components/common/Card';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { getPlacementDrives, getStudentProfile, updatePlacementProfile } from '../services/erpService';
import { Briefcase, Link as LinkIcon, CheckCircle2, Building, Calendar, DollarSign } from 'lucide-react';

export default function Placement() {
  const [drives, setDrives] = useState([]);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(null);

  const [profileForm, setProfileForm] = useState({
    skills: '',
    resume_link: '',
    github_link: '',
    linkedin_link: '',
    preferred_roles: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [drivesRes, studentRes] = await Promise.all([
        getPlacementDrives(),
        getStudentProfile(),
      ]);
      setDrives(drivesRes);
      setStudent(studentRes);
      if (studentRes) {
        setProfileForm({
          skills: studentRes.skills || '',
          resume_link: studentRes.resume_link || '',
          github_link: studentRes.github_link || '',
          linkedin_link: studentRes.linkedin_link || '',
          preferred_roles: studentRes.preferred_roles || '',
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccess(null);
    try {
      await updatePlacementProfile(profileForm);
      setSuccess('Placement profile updated successfully!');
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <PageContainer><LoadingSpinner message="Fetching placement data..." /></PageContainer>;

  return (
    <PageContainer>
      {/* Student Placement Readiness Profile */}
      <Card title="My Placement Profile & Career Readiness" icon={Briefcase}>
        {success && (
          <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-xs flex items-center space-x-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>{success}</span>
          </div>
        )}
        <form onSubmit={handleProfileSave} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Technical Skills</label>
              <input
                type="text"
                required
                value={profileForm.skills}
                onChange={(e) => setProfileForm({ ...profileForm, skills: e.target.value })}
                placeholder="React, Python, SQL, C++, AWS, etc."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Preferred Job Roles</label>
              <input
                type="text"
                value={profileForm.preferred_roles}
                onChange={(e) => setProfileForm({ ...profileForm, preferred_roles: e.target.value })}
                placeholder="Software Engineer, Data Engineer, Product Analyst"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Resume Link</label>
              <input
                type="url"
                value={profileForm.resume_link}
                onChange={(e) => setProfileForm({ ...profileForm, resume_link: e.target.value })}
                placeholder="https://drive.google.com/file/..."
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">GitHub Profile</label>
              <input
                type="url"
                value={profileForm.github_link}
                onChange={(e) => setProfileForm({ ...profileForm, github_link: e.target.value })}
                placeholder="https://github.com/username"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">LinkedIn Profile</label>
              <input
                type="url"
                value={profileForm.linkedin_link}
                onChange={(e) => setProfileForm({ ...profileForm, linkedin_link: e.target.value })}
                placeholder="https://linkedin.com/in/username"
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow-md transition disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Placement Profile'}
          </button>
        </form>
      </Card>

      {/* Upcoming Placement Drives */}
      <div className="space-y-4">
        <h3 className="text-base font-bold text-slate-900">Upcoming Campus Placement Drives</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {drives.map((d) => (
            <Card key={d.id} className="border-l-4 border-l-indigo-600">
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-indigo-600" />
                    <span className="font-extrabold text-slate-900 text-sm">{d.company_name}</span>
                  </div>
                  <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full font-extrabold text-[11px]">
                    {d.salary_package}
                  </span>
                </div>
                <p className="font-semibold text-indigo-700">{d.job_role}</p>
                <div className="p-3 bg-slate-50 rounded-xl text-slate-700 space-y-1">
                  <p className="font-medium"><strong>Eligibility:</strong> {d.eligibility_criteria}</p>
                  <p className="text-slate-500"><strong>Prep Resources:</strong> {d.preparation_resources}</p>
                </div>
                <div className="flex items-center justify-between text-slate-500 pt-1">
                  <div className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Drive Date: {d.drive_date}</span>
                  </div>
                  <span className="text-rose-600 font-semibold">Deadline: {d.application_deadline}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </PageContainer>
  );
}
