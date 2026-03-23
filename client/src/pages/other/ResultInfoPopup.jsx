import React, { useState, useEffect, useMemo } from "react";
import api from "../../redux/api";

// Format date as DD/MM/YYYY HH:MM:SS
const formatDateTime = (dateStr) => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  const h = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  const sec = String(d.getSeconds()).padStart(2, "0");
  return `${day}/${month}/${year} ${h}:${min}:${sec}`;
};

function ResultInfoPopup({
  onClose,
  gameName,
  eventName,
  marketName,
  marketId,
  gameType,
  startDate,
  endDate,
}) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [betFilter, setBetFilter] = useState("all"); // all | back | lay | deleted

  useEffect(() => {
    if (!gameName || !eventName || !marketName || !startDate || !endDate) {
      setLoading(false);
      return;
    }
    const fetchReport = async () => {
      try {
        setLoading(true);
        setError(null);
        const params = new URLSearchParams({
          page: 1,
          limit: 100,
          gameName: gameName || "",
          eventName: eventName || "",
          marketName: marketName || "",
          startDate,
          endDate,
        });
        if (marketId) params.set("marketId", marketId);
        const response = await api.get(
          `/user/profit-loss/history?${params.toString()}`,
          { withCredentials: true }
        );
        setData(response.data);
      } catch (err) {
        console.error("Error fetching profit-loss report:", err);
        setError(
          err?.response?.data?.message || "Failed to load result details"
        );
      } finally {
        setLoading(false);
      }
    };
    fetchReport();
  }, [gameName, eventName, marketName, marketId, startDate, endDate]);

  const report = data?.data?.report ?? [];
  const total = data?.data?.total ?? {
    totalBets: 0,
    totalWinAmount: 0,
    totalLossAmount: 0,
  };

  const filteredReport = useMemo(() => {
    if (!report.length) return [];
    if (betFilter === "all") return report;
    if (betFilter === "back") return report.filter((b) => b.otype === "back");
    if (betFilter === "lay") return report.filter((b) => b.otype === "lay");
    if (betFilter === "deleted") return report.filter((b) => b.status === 3);
    return report;
  }, [report, betFilter]);

  const totalAmount = useMemo(
    () => filteredReport.reduce((sum, b) => sum + (parseFloat(b.betAmount) || 0), 0),
    [filteredReport]
  );

  const eventPath = [gameName, eventName, gameType, marketName]
    .filter(Boolean)
    .join(" -> ");
  const winnerLabel =
    report.length > 0
      ? report[0].betResult ?? report[0].fancyScore ?? "-"
      : "-";
  const gameTimeStr =
    report.length > 0 && report[0].date
      ? formatDateTime(report[0].date)
      : "-";

  return (
    <div className="fixed inset-0 bg-[rgba(17,17,17,0.49)] flex justify-center items-start pt-10 z-[60] overflow-auto">
      <div className="bg-white rounded-lg w-[95%] md:w-[80%] max-w-4xl shadow-lg">
        <div className="bg-primary flex justify-between items-center p-2">
          <h2 className="text-lg font-semibold text-white">Result</h2>
          <button
            onClick={onClose}
            className="text-xl font-bold text-white hover:opacity-80"
          >
            ✕
          </button>
        </div>
        <div className="p-4 overflow-x-auto">
          {loading && (
            <div className="py-6 text-center text-gray-600">Loading...</div>
          )}
          {error && (
            <div className="py-4 text-center text-red-600">{error}</div>
          )}
          {!loading && !error && data && (
            <>
              <div className="space-y-1 text-sm text-body mb-4">
                <p>
                  <span className="font-medium">Event Path:</span>{" "}
                  {eventPath || "-"}
                </p>
                <p>
                  <span className="font-medium">Winner:</span> {winnerLabel}
                </p>
                <p>
                  <span className="font-medium">Game Time:</span>{" "}
                  {gameTimeStr}
                </p>
                <p>
                  <span className="font-medium">Bet Summary:</span> Total Bets:{" "}
                  {filteredReport.length} Total Amount:{" "}
                  <span className="text-[#086f3f] font-medium">
                    {totalAmount.toFixed(2)}
                  </span>
                </p>
              </div>

              <div className="flex gap-4 mb-4">
                {["all", "back", "lay", "deleted"].map((key) => (
                  <label key={key} className="flex items-center gap-1 cursor-pointer">
                    <input
                      type="radio"
                      name="betFilter"
                      checked={betFilter === key}
                      onChange={() => setBetFilter(key)}
                      className="mr-1"
                    />
                    <span className="capitalize text-sm">{key}</span>
                  </label>
                ))}
              </div>

              <table className="w-full border border-gray-300 text-body text-sm">
                <thead>
                  <tr className="bg-[#e0e6e6] border-b border-gray-300">
                    <th className="text-left p-2 border-r border-gray-300">
                      Nation
                    </th>
                    <th className="text-left p-2 border-r border-gray-300">
                      Rate
                    </th>
                    <th className="text-left p-2 border-r border-gray-300">
                      Bhav
                    </th>
                    <th className="text-left p-2 border-r border-gray-300">
                      Amount
                    </th>
                    <th className="text-left p-2 border-r border-gray-300">
                      Win
                    </th>
                    <th className="text-left p-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredReport.length > 0 ? (
                    filteredReport.map((row, idx) => {
                      const isWin = row.status === 1;
                      const winAmount = isWin ? (row.resultAmount ?? 0) : 0;
                      const rowBg =
                        row.otype === "back"
                          ? "bg-[#72bbef]"
                          : row.otype === "lay"
                            ? "bg-[#faa9ba]"
                            : "";
                      return (
                        <tr
                          key={row._id || idx}
                          className={`border-b border-gray-200 ${rowBg}`}
                        >
                          <td className="p-2 border-r border-gray-200">
                            {row.teamName ?? row.marketName ?? "-"}
                          </td>
                          <td className="p-2 border-r border-gray-200">
                            {row.price ?? row.xValue ?? "-"}
                          </td>
                          <td className="p-2 border-r border-gray-200">
                            {row.fancyScore ?? row.betResult ?? "-"}
                          </td>
                          <td className="p-2 border-r border-gray-200">
                            {row.betAmount ?? "-"}
                          </td>
                          <td className="p-2 border-r border-gray-200">
                            {isWin ? (
                              <span className="text-[#086f3f] font-medium">
                                {winAmount.toLocaleString()}
                              </span>
                            ) : (
                              "-"
                            )}
                          </td>
                          <td className="p-2">
                            {row.settledAt
                              ? formatDateTime(row.settledAt)
                              : "-"}
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="text-center p-4 text-gray-500"
                      >
                        No data
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default ResultInfoPopup;
