// Bizarre Industries — code samples v0.2 (richer semantic typing)
// Token roles (matching syntax.css):
//   pl plain · p punct · op operator
//   kw-ctrl (if/for/return/throw/await/yield) · kw-decl (const/fn/class/import) · kw-mod (pub/static/async)
//   s string · tmpl template body · esc escape/interpolation brace · rgx regex
//   n number · bool true/false/null · const SCREAMING_CASE
//   t type · tprim primitive type
//   f function · method · prop · param · v variable · this self/this
//   b builtin · ns namespace · d decorator · pre preprocessor
//   c comment · cdoc doc-comment · tag jsx/html tag · attr jsx/html attr

window.BZR_SAMPLES = {

  // ── TypeScript: orbital mechanics + JSX ──
  ts: {
    name: 'src/Orbit.tsx',
    lang: 'TypeScript · TSX',
    cur: 16,
    lines: [
      [['cdoc','/** catch the stars — orbital element propagator. */']],
      [['kw-decl','import'],['pl',' { '],['v','useMemo'],['p',', '],['v','useState'],['pl',' } '],['kw-decl','from'],['pl',' '],['s','"react"'],['p',';']],
      [['kw-decl','import'],['pl',' '],['kw-decl','type'],['pl',' { '],['t','Vec3'],['p',', '],['t','Orbit'],['pl',' } '],['kw-decl','from'],['pl',' '],['s','"./types"'],['p',';']],
      [['pl','']],
      [['kw-decl','export'],['pl',' '],['kw-decl','const'],['pl',' '],['const','MU_EARTH'],['pl',' '],['op','='],['pl',' '],['n','3.986e14'],['p',';'],['pl','  '],['c','// m³/s²']],
      [['kw-decl','const'],['pl',' '],['const','TAU'],['pl',' '],['op','='],['pl',' '],['b','Math'],['p','.'],['prop','PI'],['pl',' '],['op','*'],['pl',' '],['n','2'],['p',';']],
      [['pl','']],
      [['kw-decl','export'],['pl',' '],['kw-decl','function'],['pl',' '],['f','propagate'],['p','('],['param','o'],['p',': '],['t','Orbit'],['p',', '],['param','dt'],['p',': '],['tprim','number'],['p','): '],['t','Vec3'],['pl',' {']],
      [['pl','  '],['kw-ctrl','if'],['pl',' ('],['param','o'],['p','.'],['prop','e'],['pl',' '],['op','>='],['pl',' '],['n','1'],['p',') '],['kw-ctrl','throw'],['pl',' '],['kw-ctrl','new'],['pl',' '],['b','Error'],['p','('],['s','`hyperbolic: e='],['esc','${'],['param','o'],['p','.'],['prop','e'],['esc','}'],['s','`'],['p',');']],
      [['pl','  '],['kw-decl','const'],['pl',' '],['v','n'],['pl',' '],['op','='],['pl',' '],['b','Math'],['p','.'],['method','sqrt'],['p','('],['const','MU_EARTH'],['pl',' '],['op','/'],['pl',' '],['param','o'],['p','.'],['prop','a'],['pl',' '],['op','**'],['pl',' '],['n','3'],['p',');']],
      [['pl','  '],['kw-decl','const'],['pl',' '],['v','M'],['pl',' '],['op','='],['pl',' ('],['v','n'],['pl',' '],['op','*'],['pl',' '],['param','dt'],['p',') '],['op','%'],['pl',' '],['const','TAU'],['p',';']],
      [['pl','  '],['kw-ctrl','return'],['pl',' { '],['prop','x'],['p',': '],['b','Math'],['p','.'],['method','cos'],['p','('],['v','M'],['p','), '],['prop','y'],['p',': '],['b','Math'],['p','.'],['method','sin'],['p','('],['v','M'],['p','), '],['prop','z'],['p',': '],['n','0'],['pl',' };']],
      [['pl','}']],
      [['pl','']],
      [['kw-decl','export'],['pl',' '],['kw-decl','function'],['pl',' '],['f','OrbitView'],['p','({ '],['param','orbit'],['pl',' }: { '],['prop','orbit'],['p',': '],['t','Orbit'],['pl',' }) {']],
      [['pl','  '],['kw-decl','const'],['pl',' ['],['v','t'],['p',', '],['v','setT'],['pl','] '],['op','='],['pl',' '],['f','useState'],['p','('],['n','0'],['p',');']],
      [['pl','  '],['kw-decl','const'],['pl',' '],['v','pos'],['pl',' '],['op','='],['pl',' '],['f','useMemo'],['p','(() '],['op','=>'],['pl',' '],['f','propagate'],['p','('],['param','orbit'],['p',', '],['v','t'],['p','), ['],['param','orbit'],['p',', '],['v','t'],['p','])'],['p',';']],
      [['pl','  '],['kw-ctrl','return'],['pl',' ('],],
      [['pl','    <'],['tag','div'],['pl',' '],['attr','className'],['op','='],['s','"bench"'],['pl','>']],
      [['pl','      <'],['tag','code'],['pl','>{'],['s','`x='],['esc','${'],['v','pos'],['p','.'],['prop','x'],['p','.'],['method','toFixed'],['p','('],['n','3'],['p',')'],['esc','}'],['s','`'],['pl','}</'],['tag','code'],['pl','>']],
      [['pl','    </'],['tag','div'],['pl','>']],
      [['pl','  );']],
      [['pl','}']],
    ],
  },

  // ── Python: dataclass + chirp generator ──
  py: {
    name: 'bench/oscilloscope.py',
    lang: 'Python',
    cur: 14,
    lines: [
      [['cdoc','"""catch the stars — oscilloscope chirp + RMS analysis."""']],
      [['kw-decl','from'],['pl',' '],['ns','dataclasses'],['pl',' '],['kw-decl','import'],['pl',' '],['t','dataclass']],
      [['kw-decl','from'],['pl',' '],['ns','typing'],['pl',' '],['kw-decl','import'],['pl',' '],['t','Iterator'],['p',', '],['t','Final']],
      [['kw-decl','import'],['pl',' '],['ns','numpy'],['pl',' '],['kw-decl','as'],['pl',' '],['ns','np']],
      [['pl','']],
      [['const','SAMPLE_RATE'],['p',': '],['t','Final'],['p','['],['tprim','int'],['pl','] '],['op','='],['pl',' '],['n','48_000']],
      [['pl','']],
      [['d','@dataclass'],['p','('],['param','frozen'],['op','='],['bool','True'],['p',')']],
      [['kw-decl','class'],['pl',' '],['t','Trace'],['p',':']],
      [['pl','    '],['prop','samples'],['p',': '],['ns','np'],['p','.'],['t','ndarray']],
      [['pl','    '],['prop','rate_hz'],['p',': '],['tprim','float']],
      [['pl','']],
      [['pl','    '],['kw-decl','def'],['pl',' '],['f','rms'],['p','('],['this','self'],['p',') -> '],['tprim','float'],['p',':']],
      [['pl','        '],['cdoc','"""quadratic mean of the trace."""']],
      [['pl','        '],['kw-ctrl','return'],['pl',' '],['t','float'],['p','('],['ns','np'],['p','.'],['method','sqrt'],['p','('],['ns','np'],['p','.'],['method','mean'],['p','('],['this','self'],['p','.'],['prop','samples'],['pl',' '],['op','**'],['pl',' '],['n','2'],['p',')))']],
      [['pl','']],
      [['kw-decl','def'],['pl',' '],['f','sweep'],['p','('],['param','f0'],['p',': '],['tprim','float'],['p',', '],['param','f1'],['p',': '],['tprim','float'],['p',', '],['op','*'],['p',', '],['param','dur'],['p',': '],['tprim','float'],['pl',' '],['op','='],['pl',' '],['n','1.0'],['p',') -> '],['t','Iterator'],['p','['],['t','Trace'],['p',']:']],
      [['pl','    '],['cdoc','"""yield traces from a linear chirp f0 → f1 over `dur` seconds."""']],
      [['pl','    '],['v','t'],['pl',' '],['op','='],['pl',' '],['ns','np'],['p','.'],['method','linspace'],['p','('],['n','0'],['p',', '],['param','dur'],['p',', '],['const','SAMPLE_RATE'],['p',')']],
      [['pl','    '],['v','phase'],['pl',' '],['op','='],['pl',' '],['n','2'],['op','*'],['ns','np'],['p','.'],['prop','pi'],['op','*'],['p','('],['param','f0'],['op','+'],['p','('],['param','f1'],['op','-'],['param','f0'],['p',')'],['op','*'],['v','t'],['op','/'],['p','('],['n','2'],['op','*'],['param','dur'],['p','))*'],['v','t']],
      [['pl','    '],['kw-ctrl','yield'],['pl',' '],['t','Trace'],['p','('],['ns','np'],['p','.'],['method','sin'],['p','('],['v','phase'],['p','), '],['const','SAMPLE_RATE'],['p',')']],
    ],
  },

  // ── Rust: async sampler ──
  rs: {
    name: 'src/sampler.rs',
    lang: 'Rust',
    cur: 11,
    lines: [
      [['c','// catch the stars — async event sampler']],
      [['kw-decl','use'],['pl',' '],['ns','tokio'],['p','::{'],['ns','time'],['p','::{'],['v','sleep'],['p',', '],['t','Duration'],['p','}, '],['ns','sync'],['p','::'],['ns','mpsc'],['p','};']],
      [['kw-decl','use'],['pl',' '],['ns','serde'],['p','::'],['t','Serialize'],['p',';']],
      [['pl','']],
      [['d','#[derive(Serialize, Debug, Clone)]']],
      [['kw-mod','pub'],['pl',' '],['kw-decl','struct'],['pl',' '],['t','Reading'],['pl',' { '],['kw-mod','pub'],['pl',' '],['prop','t'],['p',': '],['tprim','u64'],['p',', '],['kw-mod','pub'],['pl',' '],['prop','v'],['p',': '],['tprim','f32'],['pl',' }']],
      [['pl','']],
      [['kw-mod','pub'],['pl',' '],['kw-mod','async'],['pl',' '],['kw-decl','fn'],['pl',' '],['f','run'],['p','('],['param','tx'],['p',': '],['ns','mpsc'],['p','::'],['t','Sender'],['p','<'],['t','Reading'],['p','>) -> '],['ns','anyhow'],['p','::'],['t','Result'],['p','<()> {']],
      [['pl','    '],['kw-decl','let'],['pl',' '],['kw-mod','mut'],['pl',' '],['v','t'],['p',': '],['tprim','u64'],['pl',' '],['op','='],['pl',' '],['n','0'],['p',';']],
      [['pl','    '],['kw-ctrl','loop'],['pl',' {']],
      [['pl','        '],['kw-decl','let'],['pl',' '],['v','v'],['pl',' '],['op','='],['pl',' ('],['v','t'],['pl',' '],['kw-mod','as'],['pl',' '],['tprim','f32'],['p',') '],['op','*'],['pl',' '],['n','0.013'],['p',';']],
      [['pl','        '],['param','tx'],['p','.'],['method','send'],['p','('],['t','Reading'],['pl',' { '],['prop','t'],['p',', '],['prop','v'],['pl',' }).'],['kw-ctrl','await'],['p','?;']],
      [['pl','        '],['f','sleep'],['p','('],['t','Duration'],['p','::'],['method','from_millis'],['p','('],['n','20'],['p','))'],['p','.'],['kw-ctrl','await'],['p',';']],
      [['pl','        '],['v','t'],['pl',' '],['op','+='],['pl',' '],['n','1'],['p',';']],
      [['pl','    }']],
      [['pl','}']],
    ],
  },

  // ── Go: udp relay ──
  go: {
    name: 'cmd/relay/main.go',
    lang: 'Go',
    cur: 11,
    lines: [
      [['c','// catch the stars — udp relay']],
      [['kw-decl','package'],['pl',' '],['ns','main']],
      [['pl','']],
      [['kw-decl','import'],['pl',' (']],
      [['pl','    '],['s','"context"']],
      [['pl','    '],['s','"log"']],
      [['pl','    '],['s','"net"']],
      [['pl','    '],['s','"time"']],
      [['pl',')']],
      [['pl','']],
      [['kw-decl','func'],['pl',' '],['f','main'],['p','() {']],
      [['pl','    '],['v','ctx'],['p',', '],['v','cancel'],['pl',' '],['op',':='],['pl',' '],['ns','context'],['p','.'],['method','WithTimeout'],['p','('],['ns','context'],['p','.'],['method','Background'],['p','(), '],['n','30'],['op','*'],['ns','time'],['p','.'],['const','Second'],['p',')']],
      [['pl','    '],['kw-ctrl','defer'],['pl',' '],['f','cancel'],['p','()']],
      [['pl','']],
      [['pl','    '],['v','addr'],['p',', '],['v','err'],['pl',' '],['op',':='],['pl',' '],['ns','net'],['p','.'],['method','ResolveUDPAddr'],['p','('],['s','"udp"'],['p',', '],['s','":4815"'],['p',')']],
      [['pl','    '],['kw-ctrl','if'],['pl',' '],['v','err'],['pl',' '],['op','!='],['pl',' '],['bool','nil'],['pl',' { '],['ns','log'],['p','.'],['method','Fatal'],['p','('],['v','err'],['p',') }']],
      [['pl','    '],['ns','log'],['p','.'],['method','Printf'],['p','('],['s','"relay listening on %s"'],['p',', '],['v','addr'],['p',')']],
      [['pl','    '],['op','<-'],['v','ctx'],['p','.'],['method','Done'],['p','()']],
      [['pl','}']],
    ],
  },

  // ── Lua: nvim init ──
  lua: {
    name: 'lua/bizarre/init.lua',
    lang: 'Lua',
    cur: 10,
    lines: [
      [['c','-- catch the stars — neovim bootstrap']],
      [['kw-decl','local'],['pl',' '],['v','M'],['pl',' '],['op','='],['pl',' {}']],
      [['pl','']],
      [['v','M'],['p','.'],['prop','opts'],['pl',' '],['op','='],['pl',' {']],
      [['pl','  '],['prop','transparent'],['pl',' '],['op','='],['pl',' '],['bool','false'],['p',',']],
      [['pl','  '],['prop','dim_inactive'],['pl',' '],['op','='],['pl',' '],['bool','true'],['p',',']],
      [['pl','  '],['prop','styles'],['pl',' '],['op','='],['pl',' { '],['prop','keywords'],['pl',' '],['op','='],['pl',' { '],['prop','italic'],['pl',' '],['op','='],['pl',' '],['bool','false'],['pl',' } },']],
      [['pl','}']],
      [['pl','']],
      [['kw-decl','function'],['pl',' '],['v','M'],['p','.'],['f','setup'],['p','('],['param','user'],['p',')']],
      [['pl','  '],['v','M'],['p','.'],['prop','opts'],['pl',' '],['op','='],['pl',' '],['ns','vim'],['p','.'],['method','tbl_deep_extend'],['p','('],['s','"force"'],['p',', '],['v','M'],['p','.'],['prop','opts'],['p',', '],['param','user'],['pl',' '],['op','or'],['pl',' {})']],
      [['pl','  '],['ns','vim'],['p','.'],['prop','cmd'],['p','.'],['method','colorscheme'],['p','('],['s','"bizarre"'],['p',')']],
      [['kw-decl','end']],
      [['pl','']],
      [['kw-ctrl','return'],['pl',' '],['v','M']],
    ],
  },

  // ── Shell: flash a board ──
  sh: {
    name: 'scripts/burn.zsh',
    lang: 'Shell · zsh',
    cur: 10,
    lines: [
      [['c','# catch the stars — flash a board']],
      [['b','set'],['pl',' '],['op','-euo'],['pl',' '],['v','pipefail']],
      [['pl','']],
      [['const','PORT'],['op','='],['s','"'],['esc','${'],['v','PORT'],['op',':-'],['s','/dev/tty.usbserial-0001'],['esc','}'],['s','"']],
      [['const','BAUD'],['op','='],['n','921600']],
      [['pl','']],
      [['kw-ctrl','if'],['pl',' [[ '],['op','!'],['pl',' '],['op','-e'],['pl',' '],['s','"$PORT"'],['pl',' ]]; '],['kw-ctrl','then']],
      [['pl','  '],['b','echo'],['pl',' '],['s','"no board on $PORT"'],['pl',' '],['op','>&2'],['p','; '],['b','exit'],['pl',' '],['n','1']],
      [['kw-ctrl','fi']],
      [['pl','']],
      [['f','esptool'],['pl',' '],['op','--chip'],['pl',' '],['v','esp32s3'],['pl',' '],['op','--port'],['pl',' '],['s','"$PORT"'],['pl',' '],['op','--baud'],['pl',' '],['s','"$BAUD"'],['pl',' \\']],
      [['pl','  '],['v','write_flash'],['pl',' '],['op','-z'],['pl',' '],['n','0x0'],['pl',' '],['v','build/firmware.bin']],
      [['pl','']],
      [['b','echo'],['pl',' '],['s','"✦ catch the stars."']],
    ],
  },

  // ── C: pin toggler ──
  c: {
    name: 'src/bench.c',
    lang: 'C',
    cur: 7,
    lines: [
      [['cdoc','/* catch the stars — pin toggler */']],
      [['pre','#include'],['pl',' '],['s','<stdint.h>']],
      [['pre','#include'],['pl',' '],['s','"hal.h"']],
      [['pl','']],
      [['kw-mod','static'],['pl',' '],['kw-mod','volatile'],['pl',' '],['tprim','uint32_t'],['pl',' '],['v','ticks'],['pl',' '],['op','='],['pl',' '],['n','0'],['p',';']],
      [['pl','']],
      [['tprim','void'],['pl',' '],['f','SysTick_Handler'],['p','('],['tprim','void'],['p',') { '],['v','ticks'],['op','++'],['p','; }']],
      [['pl','']],
      [['tprim','int'],['pl',' '],['f','main'],['p','('],['tprim','void'],['p',') {']],
      [['pl','    '],['f','hal_init'],['p','();']],
      [['pl','    '],['kw-ctrl','for'],['pl',' (;;) {']],
      [['pl','        '],['f','gpio_toggle'],['p','('],['const','PIN_LED'],['p',');']],
      [['pl','        '],['f','delay_ms'],['p','('],['n','120'],['p',');']],
      [['pl','    }']],
      [['pl','    '],['kw-ctrl','return'],['pl',' '],['n','0'],['p',';']],
      [['pl','}']],
    ],
  },
};
