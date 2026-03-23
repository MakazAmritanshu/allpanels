import React, { useState, useEffect } from "react";
import api from "../../redux/api";

function ExposureDetails({ onClose, userId }) {
  const [expoDetail, setExpoDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchExposureDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get("/user/exposure-details", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("auth")}`,
        },
      });
      console.log("Exposure details:", response.data);
      setExpoDetail(response.data);
    } catch (err) {
      console.error("Error fetching exposure details:", err);
      setError(err?.response?.data?.message || "Failed to load exposure details");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExposureDetails();
  }, []);

  const rows = expoDetail?.data && Array.isArray(expoDetail.data) ? expoDetail.data : [];

  return (
    <div className="fixed inset-0 bg-[rgba(17,17,17,0.49)] flex justify-center items-start pt-10 z-60 overflow-auto">
      <div className="bg-white rounded-lg w-[95%] md:w-[80%] max-w-4xl shadow-lg font-['Times_New_Roman']">
        <div className="bg-primary flex justify-between items-center p-2">
          <h2 className="text-lg font-semibold text-secondary">My Market</h2>
          <button onClick={onClose} className="text-xl font-bold text-secondary">
            ✕
          </button>
        </div>
        <div className="p-2 overflow-x-auto">
          {loading && (
            <div className="py-6 text-center text-gray-600">Loading...</div>
          )}
          {error && (
            <div className="py-4 text-center text-red-600">{error}</div>
          )}
          {!loading && !error && (
            <table className="w-full bg-body border border-gray-300 text-body">
              <thead>
                <tr className="bg-gray-100 border-b border-gray-300">
                  <th className="text-left p-2 border-r border-gray-300 last:border-r-0">Event Type</th>
                  <th className="text-left p-2 border-r border-gray-300 last:border-r-0">Event Name</th>
                  <th className="text-left p-2 border-r border-gray-300 last:border-r-0">Match Name</th>
                  <th className="text-left p-2">Trade</th>
                </tr>
              </thead>
              <tbody>
                {rows.length > 0 ? (
                  rows.map((row, idx) => (
                    <tr key={idx} className="border-b border-gray-200 hover:bg-gray-50">
                      <td className="p-2 border-r border-gray-200">{row.sportName ?? "-"}</td>
                      <td className="p-2 border-r border-gray-200">{row.eventName ?? "-"}</td>
                      <td className="p-2 border-r border-gray-200">{row.marketName ?? "-"}</td>
                      <td className="p-2">{row.betCounts ?? 0}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center p-4 text-gray-500">
                      No exposure details
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

export default ExposureDetails;
