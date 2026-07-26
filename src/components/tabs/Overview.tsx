import React from 'react';

export default function Overview() {
  return (
    <section id="overview" className="active">
      <h2 className="title">Overview</h2>
      <p className="subtitle">Every number below flows from the inputs in the other tabs. Change anything there — this page updates itself.</p>
      <div className="grid tri" style={{ marginBottom: '20px' }}>
        <div className="card">
          <h3>Liquid Cash</h3>
          <div className="stat-line">
            <span className="k">India-side (IC)</span>
            <span className="v mono" id="ov_ic">—</span>
          </div>
          <div className="stat-line">
            <span className="k">Nepal-side (NC → INR)</span>
            <span className="v mono" id="ov_nc">—</span>
          </div>
          <div className="stat-line total">
            <span className="k">Total Cash</span>
            <span className="v gold mono" id="ov_cashTotal">—</span>
          </div>
        </div>
        <div className="card">
          <h3>Investments</h3>
          <div className="stat-line">
            <span className="k">Mutual Funds</span>
            <span className="v mono" id="ov_mf">—</span>
          </div>
          <div className="stat-line">
            <span className="k">RSU (vested, net)</span>
            <span className="v mono" id="ov_rsuVested">—</span>
          </div>
          <div className="stat-line">
            <span className="k">PF+NPS+PPF+APY+etc</span>
            <span className="v mono" id="ov_pfnps">—</span>
          </div>
          <div className="stat-line total">
            <span className="k">Total Invested</span>
            <span className="v gold mono" id="ov_investedTotal">—</span>
          </div>
        </div>
        <div className="card">
          <h3>This Year's Tax (FY)</h3>
          <div className="stat-line">
            <span className="k">Total taxable income</span>
            <span className="v mono" id="ov_taxIncome">—</span>
          </div>
          <div className="stat-line">
            <span className="k">Marginal slab</span>
            <span className="v mono badge gold" id="ov_slab">—</span>
          </div>
          <div className="stat-line total">
            <span className="k">Total tax payable</span>
            <span className="v rose mono" id="ov_tax">—</span>
          </div>
        </div>
      </div>

      <div className="grid">
        <div className="card">
          <h3>Net Worth Composition</h3>
          <div className="chart-wrap">
            <canvas id="chartComposition"></canvas>
          </div>
        </div>
        <div className="card">
          <h3>Action Priorities</h3>
          <div id="priorityList"></div>
          <div className="note">Auto-generated from your current inputs — e.g. if your EMI Shield Fund is under target, it'll show here.</div>
        </div>
      </div>
    </section>
  );
}
