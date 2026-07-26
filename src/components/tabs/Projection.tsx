import React, { useMemo } from 'react';
import { useAppState } from '../../store/Store';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

export default function Projection() {
  const { state } = useAppState();

  // Calculate net worth projection
  const projectionData = useMemo(() => {
    const data: Array<{
      year: number;
      cash: number;
      mf: number;
      rsu: number;
      pfNps: number;
      total: number;
    }> = [];

    // Current values
    const cashTotal =
      state.in_icCash +
      state.accountsRows.reduce((sum, acc) => {
        if (acc.currency === 'INR') return sum + acc.amount;
        return sum + acc.amount * (1 / state.in_npr_peg);
      }, 0);

    const mfTotal = state.sipRows.reduce((sum, sip) => sum + sip.val, 0);

    const rsuTotal =
      state.rsuRows.reduce((sum, row) => {
        return sum + row.shares * state.in_sharePrice * state.in_usdInr;
      }, 0) +
      state.rsuRows.reduce((sum, row) => sum + row.cash, 0);

    const pfNpsTotal = state.in_pfNpsBalance;

    // Year 0 (current)
    data.push({
      year: new Date().getFullYear(),
      cash: cashTotal,
      mf: mfTotal,
      rsu: rsuTotal,
      pfNps: pfNpsTotal,
      total: cashTotal + mfTotal + rsuTotal + pfNpsTotal,
    });

    // Project forward
    const currentYear = new Date().getFullYear();
    const equityReturn = state.in_equityReturn / 100;
    const pfReturn = state.in_pfReturn / 100;
    const annualSaving =
      state.ledgerRows.reduce((sum, row) => {
        return (
          sum +
          row.bonus +
          row.earning -
          row.personalExp -
          row.familyExp -
          row.investRent -
          row.pfNpsEtc
        );
      }, 0) / (state.ledgerRows.length || 1);

    for (let year = 1; year <= state.in_years; year++) {
      let projCash = data[year - 1].cash + annualSaving;
      let projMf = data[year - 1].mf * (1 + equityReturn);
      let projRsu = data[year - 1].rsu * (1 + equityReturn);
      let projPfNps = data[year - 1].pfNps * (1 + pfReturn);

      data.push({
        year: currentYear + year,
        cash: projCash,
        mf: projMf,
        rsu: projRsu,
        pfNps: projPfNps,
        total: projCash + projMf + projRsu + projPfNps,
      });
    }

    return data;
  }, [state]);

  const chartData = {
    labels: projectionData.map((d) => d.year.toString()),
    datasets: [
      {
        label: 'Total Net Worth',
        data: projectionData.map((d) => d.total),
        borderColor: '#c4972e',
        backgroundColor: 'rgba(196, 151, 46, 0.1)',
        tension: 0.4,
        pointRadius: 4,
        pointHoverRadius: 6,
        pointBackgroundColor: '#c4972e',
      },
      {
        label: 'Liquid Cash',
        data: projectionData.map((d) => d.cash),
        borderColor: '#3fa796',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 3,
        pointHoverRadius: 5,
      },
      {
        label: 'Mutual Funds',
        data: projectionData.map((d) => d.mf),
        borderColor: '#8a701f',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 3,
      },
      {
        label: 'RSU',
        data: projectionData.map((d) => d.rsu),
        borderColor: '#c1554a',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 3,
      },
      {
        label: 'PF+NPS+PPF',
        data: projectionData.map((d) => d.pfNps),
        borderColor: '#64748b',
        borderDash: [5, 5],
        tension: 0.4,
        pointRadius: 3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
        labels: {
          color: '#e8e4d8',
          usePointStyle: true,
          padding: 12,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(14, 17, 22, 0.95)',
        titleColor: '#e8e4d8',
        bodyColor: '#9ba0a8',
        borderColor: '#2a303c',
        borderWidth: 1,
        padding: 10,
        displayColors: true,
        callbacks: {
          label: function (context: any) {
            let label = context.dataset.label || '';
            if (label) label += ': ';
            if (context.parsed.y !== null) {
              label += '₹' + context.parsed.y.toLocaleString('en-IN', { maximumFractionDigits: 0 });
            }
            return label;
          },
        },
      },
    },
    scales: {
      y: {
        ticks: {
          color: '#9ba0a8',
          callback: function (value: any) {
            return '₹' + (value / 1000000).toFixed(1) + 'M';
          },
        },
        grid: {
          color: '#2a303c',
        },
      },
      x: {
        ticks: {
          color: '#9ba0a8',
        },
        grid: {
          color: '#2a303c',
        },
      },
    },
  };

  const formatCurrency = (val: number): string => {
    return val.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  };

  return (
    <section id="projection" className="active" className="active">
      <h2 className="title">Net Worth Projection</h2>
      <p className="subtitle">
        {state.in_years}-year forward projection. Updated by your savings rate
        and asset returns.
      </p>

      <div className="card" style={{ marginBottom: '20px' }}>
        <h3>Net Worth Growth</h3>
        <div className="chart-wrap tall">
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* Summary */}
      <div className="grid">
        <div className="card">
          <h3>Current Net Worth</h3>
          {projectionData.length > 0 && (
            <>
              <div className="stat-line">
                <span className="k">Liquid Cash</span>
                <span className="v mono">
                  ₹{formatCurrency(projectionData[0].cash)}
                </span>
              </div>
              <div className="stat-line">
                <span className="k">Mutual Funds</span>
                <span className="v mono">
                  ₹{formatCurrency(projectionData[0].mf)}
                </span>
              </div>
              <div className="stat-line">
                <span className="k">RSU (net)</span>
                <span className="v mono">
                  ₹{formatCurrency(projectionData[0].rsu)}
                </span>
              </div>
              <div className="stat-line">
                <span className="k">PF+NPS+PPF+etc</span>
                <span className="v mono">
                  ₹{formatCurrency(projectionData[0].pfNps)}
                </span>
              </div>
              <div className="stat-line total">
                <span className="k">Total</span>
                <span className="v gold mono">
                  ₹{formatCurrency(projectionData[0].total)}
                </span>
              </div>
            </>
          )}
        </div>

        <div className="card">
          <h3>Projected in {state.in_years} Years</h3>
          {projectionData.length > state.in_years && (
            <>
              <div className="stat-line">
                <span className="k">Liquid Cash</span>
                <span className="v mono">
                  ₹{formatCurrency(projectionData[state.in_years].cash)}
                </span>
              </div>
              <div className="stat-line">
                <span className="k">Mutual Funds</span>
                <span className="v mono">
                  ₹{formatCurrency(projectionData[state.in_years].mf)}
                </span>
              </div>
              <div className="stat-line">
                <span className="k">RSU (net)</span>
                <span className="v mono">
                  ₹{formatCurrency(projectionData[state.in_years].rsu)}
                </span>
              </div>
              <div className="stat-line">
                <span className="k">PF+NPS+PPF+etc</span>
                <span className="v mono">
                  ₹{formatCurrency(projectionData[state.in_years].pfNps)}
                </span>
              </div>
              <div className="stat-line total">
                <span className="k">Total</span>
                <span className="v gold mono">
                  ₹{formatCurrency(projectionData[state.in_years].total)}
                </span>
              </div>
              <div className="note" style={{ marginTop: '12px' }}>
                Growth:{' '}
                {(
                  (projectionData[state.in_years].total /
                    projectionData[0].total -
                    1) *
                  100
                ).toFixed(1)}
                %
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
