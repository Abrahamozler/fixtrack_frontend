// Simple frontend to use with the FixTrack Pro backend
if(!API_BASE || API_BASE.includes('REPLACE_WITH')){
  console.warn('Please set API_BASE in config.js to your Render backend URL.');
}

const qs = id => document.getElementById(id);
let token = null;
let editId = null;

document.addEventListener('DOMContentLoaded', ()=>{
  qs('recDate').value = new Date().toISOString().slice(0,10);
  bindEvents();
});

function bindEvents(){
  qs('loginBtn').onclick = login;
  qs('registerBtn').onclick = register;
  qs('logoutBtn').onclick = ()=>{ token=null; showAuth(); };
  qs('newRecordBtn').onclick = ()=>{ showForm(); };
  qs('cancelRecordBtn').onclick = ()=>{ hideForm(); };
  qs('addPartBtn').onclick = addPart;
  qs('saveRecordBtn').onclick = saveRecord;
  qs('search').addEventListener('input', renderTable);
  qs('filterStatus').addEventListener('change', renderTable);
  showAuth();
  renderTable();
}

function showAuth(){ qs('auth').classList.remove('hide'); qs('mainUI').classList.add('hide'); qs('user-info').innerText='Not signed in'; }

function showMain(userEmail){ qs('auth').classList.add('hide'); qs('mainUI').classList.remove('hide'); qs('user-info').innerText = userEmail; renderTable(); }

async function login(){
  const email = qs('email').value; const password = qs('password').value;
  if(!email||!password){ alert('enter email & password'); return; }
  const res = await fetch(API_BASE + '/api/auth/login', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password}) });
  const data = await res.json();
  if(res.ok){ token = data.token; showMain(data.email); } else alert(data.message || 'Login failed');
}

async function register(){
  const email = qs('email').value; const password = qs('password').value;
  if(!email||!password){ alert('enter email & password'); return; }
  const res = await fetch(API_BASE + '/api/auth/register', { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({email,password}) });
  const data = await res.json();
  if(res.ok){ alert('Registered. Please sign in.'); } else alert(data.message || 'Register failed');
}

function addPart(){
  const name = qs('partName').value.trim(); const price = Number(qs('partPrice').value)||0;
  if(!name){ alert('part name required'); return; }
  const node = document.createElement('div'); node.textContent = name + ' — ₹' + price; node.dataset.name = name; node.dataset.price = price;
  const rem = document.createElement('button'); rem.innerText='Remove'; rem.onclick = ()=>node.remove();
  node.appendChild(rem);
  qs('partsList').appendChild(node);
  qs('partName').value=''; qs('partPrice').value='';
}

function showForm(record){
  qs('formCard').classList.remove('hide'); qs('formTitle').innerText = record? 'Edit Record':'New Record';
  if(record){ editId = record._id; qs('recDate').value = record.date.slice(0,10); qs('recModel').value = record.model; qs('recCustomer').value = record.customerName||''; qs('recPhone').value = record.customerPhone||''; qs('recComplaint').value = record.complaint||''; qs('serviceCharge').value = record.serviceCharge||0; qs('paymentStatus').value = record.status||'paid'; qs('partsList').innerHTML=''; (record.parts||[]).forEach(p=>{ const n=document.createElement('div'); n.textContent=p.name+' — ₹'+p.price; n.dataset.name=p.name; n.dataset.price=p.price; const rem=document.createElement('button'); rem.innerText='Remove'; rem.onclick=()=>n.remove(); n.appendChild(rem); qs('partsList').appendChild(n); }) } else { editId=null; qs('recDate').value=new Date().toISOString().slice(0,10); qs('recModel').value=''; qs('recCustomer').value=''; qs('recPhone').value=''; qs('recComplaint').value=''; qs('serviceCharge').value=0; qs('paymentStatus').value='paid'; qs('partsList').innerHTML=''; }
}

function hideForm(){ qs('formCard').classList.add('hide'); editId=null; }

async function saveRecord(){
  const date = qs('recDate').value; const model = qs('recModel').value.trim();
  if(!model){ alert('model required'); return; }
  const customerName = qs('recCustomer').value.trim(); const customerPhone = qs('recPhone').value.trim(); const complaint = qs('recComplaint').value.trim();
  const serviceCharge = Number(qs('serviceCharge').value)||0; const status = qs('paymentStatus').value;
  const parts = Array.from(qs('partsList').children).map(n=>({name:n.dataset.name, price:Number(n.dataset.price)||0}));
  const partsTotal = parts.reduce((s,p)=>s+p.price,0);
  const total = partsTotal + serviceCharge;
  const payload = { date, model, customerName, customerPhone, complaint, parts, serviceCharge, total, status };
  const opts = { method: editId ? 'PUT':'POST', headers:{'Content-Type':'application/json', 'Authorization': token ? 'Bearer '+token : ''}, body: JSON.stringify(payload) };
  const url = API_BASE + '/api/repairs' + (editId ? '/'+editId : '');
  const res = await fetch(url, opts);
  const data = await res.json();
  if(res.ok){ hideForm(); renderTable(); } else alert(data.message || 'Save failed');
}

async function renderTable(){
  const q = qs('search').value.trim().toLowerCase(); const filter = qs('filterStatus').value;
  let url = API_BASE + '/api/repairs';
  const res = await fetch(url, { headers: { 'Authorization': token ? 'Bearer '+token : '' } });
  const records = await res.json();
  const tbody = qs('recordsTable').querySelector('tbody'); tbody.innerHTML='';
  records.filter(r=>{
    if(filter!=='all' && r.status!==filter) return false;
    if(!q) return true;
    return (r.model||'').toLowerCase().includes(q) || (r.customerName||'').toLowerCase().includes(q) || (r.complaint||'').toLowerCase().includes(q);
  }).forEach(r=>{
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.date.slice(0,10)}</td><td>${r.model}</td><td>${r.customerName||''}</td><td>₹${r.total}</td><td>${r.status}</td><td></td>`;
    const actions = tr.querySelector('td:last-child');
    const viewBtn = document.createElement('button'); viewBtn.innerText='Edit'; viewBtn.onclick = ()=> showForm(r);
    const delBtn = document.createElement('button'); delBtn.innerText='Delete'; delBtn.onclick = async ()=>{ if(confirm('Delete?')){ const res = await fetch(API_BASE+'/api/repairs/'+r._id,{method:'DELETE', headers:{'Authorization': token ? 'Bearer '+token : ''}}); if(res.ok) renderTable(); else alert('Delete failed'); } };
    actions.appendChild(viewBtn); actions.appendChild(delBtn);
    tbody.appendChild(tr);
  });
}
