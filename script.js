/* ─────────────────────────────────────────────────────────────────────────────
   SCORES — alinhados com a planilha Calculadora RFN
   ───────────────────────────────────────────────────────────────────────────── */
// Scores idênticos à planilha (coluna G/H/I = opção1/opção2/opção3)
const REG = {
  cliente:           { 1:0,  2:0  },
  cliNovo:           { 1:2,  2:7  },   // Sim=2 | Não=7
  cliCasa:           { 1:3,  2:7  },   // Recorrente=3 | Pontual=7
  demandaQuaPre:     { 1:1,  2:3  },   // Preço=1 | Qualidade=3
  nivConco:          { 1:1,  2:2,  3:3 }, // Alta=1 | Média=2 | Baixa=3
  negociacao:        { 1:1,  2:2,  3:3 }, // Executivo=1 | Diretor/CLevel=2 | Acionista=3
  nivSenioridadeExe: { 1:1,  2:2,  3:3 }, // Júnior=1 | Pleno=2 | Sênior=3
  nivSenioridadeRev: { 1:1,  2:3,  3:4 }, // Júnior=1 | Pleno=3 | Sênior=4
  timeExe:           { 1:1,  2:2  },   // Uma UNE=1 | Mais de uma=2
  nivOcu:            { 1:2,  2:4,  3:6 }, // Ocioso=2 | Disponível=4 | MuitoOcupado=6
  grauComplex:       { 1:10, 2:7,  3:3 }, // Alta=10 | Média=7 | Baixa=3
  estudosAprof:      { 1:6,  2:2  },   // Sim=6 | Não=2
  qtdReuniao:        { 1:3,  2:1  },   // Sim=3 | Não=1
  impactoEco:        { 1:2,  2:4,  3:8 }, // 0-100K=2 | 100K-1M=4 | Acima1M=8
  remuAdicional:     { 1:4,  2:1  },   // Sim=4 | Não=1
  nivUrg:            { 1:8,  2:4,  3:2 }, // Alta=8 | Média=4 | Baixa=2
  minutaPrev:        { 1:2,  2:1  },   // Há minuta=2 | Não há minuta=1  ← planilha K20=MAX(2,1)=2
  modeloPartido:     { 1:3,  2:1  },   // Sim=3 | Não=1
};

// Pesos por pergunta (coluna J da planilha)
const PESOS = {
  cliente:0, cliNovo:1, cliCasa:1, demandaQuaPre:1, nivConco:2, negociacao:2,
  nivSenioridadeExe:1, nivSenioridadeRev:1, timeExe:1, nivOcu:1,
  grauComplex:1, estudosAprof:1, qtdReuniao:1, impactoEco:2,
  remuAdicional:1, nivUrg:2, minutaPrev:1, modeloPartido:2,
};
// Teto fixo = 100 (K23 da planilha = SUM(K4:K22) - K5_cliNovo = 100)
// O máximo de cliNovo e cliCasa é 7 cada, mas apenas uma fica ativa,
// então ambas contribuem no máximo 7 — o total nunca passa de 100.

const VALOR_HORA_TETO = 900;
const VALOR_HORA_MIN  = 300;

function calcValorHora(pontuacao) {
  const vh = (pontuacao / 100) * VALOR_HORA_TETO;
  return Math.max(vh, VALOR_HORA_MIN);
}

function fmtBRL(v) {
  return v.toLocaleString('pt-BR', { style:'currency', currency:'BRL', minimumFractionDigits:2 });
}

/* ─────────────────────────────────────────────────────────────────────────────
   QUESTIONÁRIO
   ───────────────────────────────────────────────────────────────────────────── */
const QS = [
  {
    id:'cliente', s:'Perfil do Cliente',
    t:'É cliente novo ou da casa?',
    o:['Novo','Da Casa'],
    hint:'Clientes novos têm maior potencial de recorrência futura, impactando o valor estratégico da demanda para o escritório.',
  },
  {
    id:'cliNovo', s:'Perfil do Cliente',
    t:'Existe potencial de geração de recorrência?',
    o:['Sim','Não'],
    dep:{ id:'cliente', v:1 },
    hint:'Clientes com alto potencial recorrente justificam uma postura comercial mais competitiva na precificação inicial.',
  },
  {
    id:'cliCasa', s:'Perfil do Cliente',
    t:'Cliente recorrente ou pontual do escritório?',
    o:['Recorrente','Pontual'],
    dep:{ id:'cliente', v:2 },
    hint:'A fidelidade do cliente à banca influencia diretamente a margem de negociação e o escopo de serviços oferecidos.',
  },
  {
    id:'demandaQuaPre', s:'Estratégia Comercial',
    t:'O cliente decidirá a contratação por preço ou qualidade?',
    o:['Preço','Qualidade'],
    hint:'Quando o critério de decisão é qualidade, há maior flexibilidade para precificar adequadamente a expertise do escritório.',
  },
  {
    id:'nivConco', s:'Estratégia Comercial',
    t:'Qual o nível de concorrência para esse serviço?',
    o:['Alta','Média','Baixa'],
    hint:'Em mercados com baixa concorrência, o escritório possui maior poder de precificação e diferenciação.',
  },
  {
    id:'negociacao', s:'Estratégia Comercial',
    t:'Com quem está sendo feita a negociação?',
    o:['Executivo','Diretor / C-Level','Acionista'],
    hint:'A senioridade do interlocutor indica o nível estratégico da demanda e influencia a autoridade para aprovação de honorários.',
  },
  {
    id:'nivSenioridadeExe', s:'Time & Execução',
    t:'Qual o nível de senioridade do executor?',
    o:['Júnior','Pleno','Sênior'],
    hint:'Profissionais mais sêniores agregam maior valor técnico mas representam custo hora mais elevado para o escritório.',
  },
  {
    id:'nivSenioridadeRev', s:'Time & Execução',
    t:'Qual o nível de senioridade do revisor?',
    o:['Júnior','Pleno','Sênior'],
    hint:'O revisor garante a qualidade técnica da entrega. Um revisor sênior reduz riscos jurídicos, mas eleva o custo operacional.',
  },
  {
    id:'timeExe', s:'Time & Execução',
    t:'O time executor será de uma única UNE ou mais?',
    o:['Uma UNE','Mais de uma UNE'],
    hint:'Demandas multidisciplinares envolvendo mais de uma Unidade de Negócio demandam maior coordenação e têm custo operacional mais alto.',
  },
  {
    id:'nivOcu', s:'Time & Execução',
    t:'Qual o nível de ocupação do time executor?',
    o:['Ocioso','Disponível','Muito Ocupado'],
    hint:'Times muito ocupados têm menor capacidade produtiva disponível, o que pode impactar prazo e qualidade da entrega.',
  },
  {
    id:'grauComplex', s:'Complexidade',
    t:'Qual o grau de complexidade da demanda?',
    o:['Alta','Média','Baixa'],
    hint:'Demandas complexas exigem pesquisa aprofundada, maior número de revisões e envolvimento de especialistas, elevando o valor do trabalho.',
  },
  {
    id:'estudosAprof', s:'Complexidade',
    t:'Há necessidade de estudos aprofundados, pareceres ou estratégias inéditas?',
    o:['Sim','Não'],
    hint:'Elaborar pareceres ou estratégias inéditas representa criação intelectual de alto valor, justificando honorários diferenciados.',
  },
  {
    id:'qtdReuniao', s:'Relacionamento',
    t:'Estão previstas mais de três reuniões com o cliente?',
    o:['Sim','Não'],
    hint:'Reuniões frequentes demandam preparo, deslocamento e tempo de profissionais sêniores, gerando custo operacional significativo.',
  },
  {
    id:'impactoEco', s:'Impacto & Urgência',
    t:'Qual o nível de impacto econômico da demanda (valor anual)?',
    o:['0 – 100K','100K – 1M','Acima de 1M'],
    hint:'O impacto econômico considera o valor anual estimado envolvido na demanda — economia potencial, recuperação de valores, mitigação de riscos ou incremento de resultado financeiro para o cliente.',
  },
  {
    id:'remuAdicional', s:'Impacto & Urgência',
    t:'Há possibilidade de remuneração adicional sobre o benefício econômico?',
    o:['Sim','Não'],
    hint:'Quando existe possibilidade de êxito ou prêmio, a proposta pode prever honorários fixos menores combinados com remuneração variável vinculada aos resultados obtidos.',
  },
  {
    id:'nivUrg', s:'Impacto & Urgência',
    t:'Qual o nível de urgência para o cliente?',
    o:['Alta','Média','Baixa'],
    hint:'Alta urgência exige remanejamento de prioridades internas, horas extras e atenção concentrada, elevando o custo real da operação.',
  },
  {
    id:'minutaPrev', s:'Condições de Execução',
    t:'Há minuta prévia a ser utilizada?',
    o:['Há minuta','Não há minuta'],
    hint:'Partir de uma minuta existente reduz o tempo de elaboração. Sem modelo prévio, todo o trabalho criativo é feito do zero.',
  },
  {
    id:'modeloPartido', s:'Condições de Execução',
    t:'O modelo de contratação solicitado é partido?',
    o:['Sim','Não'],
    hint:'O modelo de honorários partido distribui o recebimento ao longo do processo, impactando o fluxo de caixa do escritório.',
  },
  {
    id:'__horas', s:'Estimativa DFA',
    t:'Qual o tempo esperado para execução da demanda?',
    tipo:'num',
    hint:'A estimativa de horas pela DFA é a base de cálculo final. Informe com precisão — esse número, combinado com a pontuação, determina o valor orientativo da proposta.',
  },
];

/* ─────────────────────────────────────────────────────────────────────────────
   ESTADO
   ───────────────────────────────────────────────────────────────────────────── */
let resp      = {};
let idx       = 0;
let regInfo   = { modelo:'', empresa:'', area:'' };
let historyDB = JSON.parse(localStorage.getItem('dfa_history') || '[]');
let histSearch = '';
let histFilter = '';

/* ─────────────────────────────────────────────────────────────────────────────
   HELPERS
   ───────────────────────────────────────────────────────────────────────────── */
function ativas() {
  return QS.filter(p => !p.dep || resp[p.dep.id] === p.dep.v);
}

function sc() { window.scrollTo({ top:0, behavior:'smooth' }); }

function saveToHistory(entry) {
  historyDB.unshift(entry);
  if (historyDB.length > 100) historyDB = historyDB.slice(0, 100);
  localStorage.setItem('dfa_history', JSON.stringify(historyDB));
}

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleDateString('pt-BR', { day:'2-digit', month:'2-digit', year:'2-digit' });
}

/* ─────────────────────────────────────────────────────────────────────────────
   CÁLCULO DE PONTUAÇÃO — idêntico à planilha
   Fórmula: L (Preço) = score_escolhido × peso
   Total   = SUM(L4:L22)  →  máximo = 100
   ───────────────────────────────────────────────────────────────────────────── */
function calcScore() {
  let soma = 0;
  for (const p of QS) {
    if (p.id === '__horas') continue;
    if (!REG[p.id] || !PESOS[p.id]) continue;
    // Pergunta condicional inativa: não pontua
    if (p.dep && resp[p.dep.id] !== p.dep.v) continue;
    const r = resp[p.id];
    if (!r) continue;
    soma += (REG[p.id][r] || 0) * PESOS[p.id];
  }
  return Math.round(soma * 100) / 100;
}

/* ─────────────────────────────────────────────────────────────────────────────
   VIEWS
   ───────────────────────────────────────────────────────────────────────────── */
function setView(view) {
  document.getElementById('registerWrap').style.display = view === 'register' ? '' : 'none';
  document.getElementById('formCard').style.display     = view === 'form'     ? '' : 'none';
  document.getElementById('hintArea').style.display     = view === 'form'     ? '' : 'none';
  document.getElementById('pauseWrap').classList.toggle('on', view === 'pause');
  document.getElementById('resultWrap').classList.toggle('on', view === 'result');
  document.getElementById('btnPauseTop').classList.toggle('visible', view === 'form');
}

/* ─────────────────────────────────────────────────────────────────────────────
   REGISTRO
   ───────────────────────────────────────────────────────────────────────────── */
function startEvaluation() {
  const modelo  = document.getElementById('fModelo').value.trim();
  const empresa = document.getElementById('fEmpresa').value.trim();
  const area    = document.getElementById('fArea').value;

  if (!modelo || !empresa || !area) {
    ['fModelo','fEmpresa','fArea'].forEach(id => {
      const el = document.getElementById(id);
      if (!el.value.trim()) {
        el.style.borderColor = '#EF4444';
        el.style.boxShadow   = '0 0 0 3px rgba(239,68,68,.12)';
        setTimeout(() => { el.style.borderColor = ''; el.style.boxShadow = ''; }, 1800);
      }
    });
    return;
  }

  regInfo = { modelo, empresa, area };
  resp    = {};
  idx     = 0;
  render();
}

/* ─────────────────────────────────────────────────────────────────────────────
   RENDER PERGUNTA
   ───────────────────────────────────────────────────────────────────────────── */
function render() {
  const list  = ativas();
  const total = list.length;
  const p     = list[idx];

  document.getElementById('headerBadge').textContent = p.s;
  document.getElementById('progCount').textContent   = `${idx+1} de ${total}`;
  document.getElementById('progFill').style.width    = `${((idx+1)/total)*100}%`;
  document.getElementById('btnPrev').disabled        = idx === 0;
  document.getElementById('btnNext').textContent     = idx === total-1 ? 'Calcular' : 'Próxima';

  let html = `
    <div class="q-header" style="margin:20px 24px 0;">
      <div class="q-title">Pergunta ${idx+1}</div>
      <div class="q-text">${p.t}</div>
    </div>`;

  if (p.tipo === 'num') {
    html += `
      <div class="inp-section">
        <div class="num-wrap">
          <input type="number" id="hInput" min="1" placeholder="0" value="${resp['__horas']||''}">
          <span class="num-unit">horas</span>
        </div>
        <p class="num-hint">Informe a estimativa de horas da DFA para execução desta demanda.</p>
      </div>`;
  } else {
    const opts = p.o.map((o,i) => {
      const sel = resp[p.id] === (i+1) ? 'sel' : '';
      return `<button class="opt ${sel}" data-v="${i+1}" onclick="pick('${p.id}',${i+1})">
        <span class="opt-dot"></span>
        <span class="opt-text">${o}</span>
      </button>`;
    }).join('');
    html += `<div class="options">${opts}</div>`;
  }

  document.getElementById('qContent').innerHTML = html;

  const hintEl = document.getElementById('hintArea');
  if (p.hint) {
    hintEl.innerHTML = `
      <div class="q-hint-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <path d="M12 16v-4M12 8h.01"/>
        </svg>
      </div>
      <div class="q-hint-text"><strong>Por que essa pergunta?</strong> ${p.hint}</div>`;
  } else {
    hintEl.innerHTML = '';
  }

  setView('form');
  if (p.tipo === 'num') setTimeout(() => document.getElementById('hInput')?.focus(), 40);
}

/* ─────────────────────────────────────────────────────────────────────────────
   INTERAÇÃO
   ───────────────────────────────────────────────────────────────────────────── */
function pick(id, v) {
  resp[id] = v;
  document.querySelectorAll('.opt').forEach(el => {
    el.classList.toggle('sel', parseInt(el.dataset.v) === v);
  });
  setTimeout(() => go(1), 280);
}

function go(dir) {
  const list = ativas();
  const p    = list[idx];

  if (dir === 1) {
    if (p.tipo === 'num') {
      const v = parseInt(document.getElementById('hInput')?.value);
      if (!v || v < 1) { document.getElementById('hInput').focus(); return; }
      resp['__horas'] = v;
    } else {
      if (!resp[p.id]) return;
    }
    if (idx < list.length-1) { idx++; render(); sc(); }
    else showResult();
  } else {
    if (idx > 0) { idx--; render(); sc(); }
  }
}

function pause() {
  document.getElementById('pausePill').textContent   = `Etapa ${idx+1} de ${ativas().length}`;
  document.getElementById('headerBadge').textContent = 'Pausado';
  setView('pause');
  sc();
}

function resume() { render(); sc(); }

/* ─────────────────────────────────────────────────────────────────────────────
   RESULTADO
   ───────────────────────────────────────────────────────────────────────────── */

function showResult() {
  document.getElementById('headerBadge').textContent = 'Resultado';
  setView('result');

  const pontuacao  = calcScore();
  const horas      = resp['__horas'] || 0;
  const valorHora  = calcValorHora(pontuacao);
  const valorTotal = valorHora * horas;
  const temRemu    = resp['remuAdicional'] === 1;

  /* Animação do score */
  const el  = document.getElementById('rScore');
  let cur   = 0;
  const stp = Math.max(0.1, pontuacao / 55);
  const tmr = setInterval(() => {
    cur = Math.min(cur + stp, pontuacao);
    el.textContent = cur.toFixed(1);
    if (cur >= pontuacao) { el.textContent = pontuacao.toFixed(1); clearInterval(tmr); }
  }, 18);

  document.getElementById('rSoma').textContent      = pontuacao.toFixed(1) + ' pts';
  document.getElementById('rHoras').textContent     = horas + 'h';
  document.getElementById('rValorHora').textContent = fmtBRL(valorHora);
  document.getElementById('rValorTotal').textContent= fmtBRL(valorTotal);
  document.getElementById('rModelo').textContent    = regInfo.modelo;
  document.getElementById('rEmpresa').textContent   = regInfo.empresa;
  document.getElementById('rArea').textContent      = regInfo.area;



  const entry = {
    id: Date.now(), modelo: regInfo.modelo, empresa: regInfo.empresa,
    area: regInfo.area, score: pontuacao, horas, valorHora, valorTotal,
    temRemu, date: new Date().toISOString(),
  };
  saveToHistory(entry);
  sc();
}

function restart() {
  resp = {}; idx = 0;
  document.getElementById('fModelo').value  = '';
  document.getElementById('fEmpresa').value = '';
  document.getElementById('fArea').value    = '';
  setView('register');
  sc();
}

/* ─────────────────────────────────────────────────────────────────────────────
   HISTÓRICO
   ───────────────────────────────────────────────────────────────────────────── */
function openHistory() {
  histSearch = '';
  histFilter = '';
  document.getElementById('histSearch').value = '';
  document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
  renderHistory();
  document.getElementById('historyModal').classList.add('on');
}

function closeHistory() {
  document.getElementById('historyModal').classList.remove('on');
}

function renderHistory() {
  const q    = histSearch.toLowerCase();
  const list = historyDB.filter(e => {
    const matchSearch = !q || e.empresa.toLowerCase().includes(q) ||
      e.modelo.toLowerCase().includes(q) || e.area.toLowerCase().includes(q);
    const matchFilter = !histFilter || e.empresa === histFilter || e.area === histFilter;
    return matchSearch && (!histFilter || matchFilter);
  });

  const areas    = [...new Set(historyDB.map(e => e.area))].slice(0,6);
  const empresas = [...new Set(historyDB.map(e => e.empresa))].slice(0,4);

  let chipsHTML = `<button class="filter-chip ${!histFilter ? 'active':''}" onclick="setFilter('')">Todos</button>`;
  empresas.forEach(e => {
    chipsHTML += `<button class="filter-chip ${histFilter===e?'active':''}" onclick="setFilter('${e.replace(/'/g,"\\'")}')">🏢 ${e}</button>`;
  });
  areas.forEach(a => {
    chipsHTML += `<button class="filter-chip ${histFilter===a?'active':''}" onclick="setFilter('${a.replace(/'/g,"\\'")}')">📂 ${a}</button>`;
  });
  document.getElementById('histFilters').innerHTML = chipsHTML;

  if (list.length === 0) {
    document.getElementById('histList').innerHTML = `
      <div class="history-empty">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
        </svg>
        ${historyDB.length === 0 ? 'Nenhuma avaliação salva ainda.' : 'Nenhum resultado encontrado.'}
      </div>`;
    return;
  }

  document.getElementById('histList').innerHTML = list.map(e => `
    <div class="history-item" onclick="loadFromHistory(${e.id})">
      <div class="history-item-icon">${e.empresa.charAt(0).toUpperCase()}</div>
      <div class="history-item-info">
        <div class="history-item-name">${e.empresa}</div>
        <div class="history-item-meta">${e.modelo} · ${e.area}</div>
      </div>
      <div class="history-item-right">
        <div class="history-item-score">${(e.score||0).toFixed(1)} pts</div>
        ${e.valorTotal ? `<div class="history-item-valor">${fmtBRL(e.valorTotal)}</div>` : ''}
      </div>
      <div class="history-item-date">${formatDate(e.date)}</div>
    </div>`).join('');
}

function setFilter(val) {
  histFilter = val;
  renderHistory();
}

function loadFromHistory(id) {
  const entry = historyDB.find(e => e.id === id);
  if (!entry) return;
  closeHistory();

  document.getElementById('headerBadge').textContent   = 'Resultado';
  setView('result');
  document.getElementById('rScore').textContent        = (entry.score||0).toFixed(1);
  document.getElementById('rSoma').textContent         = (entry.score||0).toFixed(1) + ' pts';
  document.getElementById('rHoras').textContent        = (entry.horas||0) + 'h';
  document.getElementById('rValorHora').textContent    = entry.valorHora  ? fmtBRL(entry.valorHora)  : '—';
  document.getElementById('rValorTotal').textContent   = entry.valorTotal ? fmtBRL(entry.valorTotal) : '—';
  document.getElementById('rModelo').textContent       = entry.modelo;
  document.getElementById('rEmpresa').textContent      = entry.empresa;
  document.getElementById('rArea').textContent         = entry.area;


  sc();
}

/* ─────────────────────────────────────────────────────────────────────────────
   EVENTOS
   ───────────────────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('histSearch').addEventListener('input', e => {
    histSearch = e.target.value;
    renderHistory();
  });
  document.getElementById('historyModal').addEventListener('click', e => {
    if (e.target === document.getElementById('historyModal')) closeHistory();
  });
  document.getElementById('logoInput').addEventListener('change', e => {
    const f = e.target.files[0]; if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      const img = document.getElementById('logoImg');
      img.src = ev.target.result; img.style.display = 'block';
      document.querySelector('#logoBox span').style.display = 'none';
    };
    r.readAsDataURL(f);
  });
});

document.addEventListener('keydown', e => {
  if (document.getElementById('historyModal').classList.contains('on')) {
    if (e.key === 'Escape') closeHistory();
    return;
  }
  const list = ativas();
  const p    = list[idx];
  if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName) && e.key === 'Enter') { e.preventDefault(); go(1); return; }
  if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;
  if (e.key === 'Enter')  { go(1);   return; }
  if (e.key === 'Escape') { pause(); return; }
  const nums = {'1':1,'2':2,'3':3,'4':4};
  const v    = nums[e.key];
  if (v && p && !p.tipo && p.o[v-1]) pick(p.id, v);
});
