/**
 * Sling Jump Analytics - Data Export & BI Utility
 * Generates standards-compliant CSV and JSON payloads for Tableau, Excel, and custom data lakes.
 */
(function(window) {
  'use strict';

  function downloadBlob(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function exportRunsToCSV(runs) {
    if (!runs || runs.length === 0) {
      alert('Keine Flüge für den CSV-Export vorhanden.');
      return;
    }

    const headers = ['Timestamp', 'RunID', 'GamerTag', 'DeviceID', 'Ship', 'AltitudeMeters', 'CoinsCollected', 'DurationSec', 'NearMisses', 'FatalHazard', 'ReviveUsed', 'UTMSource', 'Platform'];
    const rows = runs.map(r => [
      `"${r.timestamp}"`,
      `"${r.id || ''}"`,
      `"${r.gamerTag || 'Player'}"`,
      `"${r.deviceId || ''}"`,
      `"${r.shipId || 'arrow'}"`,
      r.altitude || 0,
      r.coins || 0,
      r.duration || 0,
      r.nearMisses || 0,
      `"${r.hazard || 'void_fall'}"`,
      r.reviveUsed ? 'true' : 'false',
      `"${r.source || 'direct'}"`,
      `"${r.platform || 'Unknown'}"`
    ]);

    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\r\n');
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadBlob(csvContent, `sling_jump_runs_${timestamp}.csv`, 'text/csv;charset=utf-8;');
  }

  function exportDatasetToJSON(dataset) {
    if (!dataset) {
      alert('Kein Datensatz zum Exportieren vorhanden.');
      return;
    }
    const jsonStr = JSON.stringify(dataset, null, 2);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    downloadBlob(jsonStr, `sling_jump_telemetry_dump_${timestamp}.json`, 'application/json;charset=utf-8;');
  }

  async function copyToClipboard(text) {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
        return true;
      }
    } catch (e) {}
    
    // Fallback textarea
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const success = document.execCommand('copy');
    document.body.removeChild(ta);
    return success;
  }

  window.SJExportService = {
    exportRunsToCSV,
    exportDatasetToJSON,
    copyToClipboard
  };

})(window);
