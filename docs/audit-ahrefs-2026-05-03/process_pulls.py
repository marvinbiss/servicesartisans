import json,sys,io,csv,re,os,math
from collections import defaultdict
sys.stdout=io.TextIOWrapper(sys.stdout.buffer,encoding='utf-8')

BASE=r"C:\Users\USER\Downloads\_phase0_audit"
COMPS=['hellio','sonergia','selectra','effy','france_renov']
SEG=re.compile(r'(renov|aide|cee|rge|isol|pompe|chauf|energie|maprime|prime|dpe|panneau|solaire|certifi|qualibat|qualifelec|qualipac|vmc|chaudiere|borne|thermostat|ventilation|ravalement|toiture|combles|granul|geothermique|biomasse|fioul|gaz|electrique|photovolt|hybride|condensation|simulateur|maprimerenov|artisan|devis|travaux)',re.I)

# Pull 1 — Content gap
all_kws=defaultdict(dict)
for comp in COMPS:
    p=os.path.join(BASE,'A_competitors',comp,'kw_5000_byvolume.json')
    data=json.load(open(p,encoding='utf-8'))
    for k in data.get('keywords',[]):
        kw=k.get('keyword','').strip()
        if not kw: continue
        all_kws[kw][comp]={
            'pos':k.get('best_position'),'traf':k.get('sum_traffic',0),
            'url':k.get('best_position_url',''),'vol':k.get('volume',0),
            'kd':k.get('keyword_difficulty',0),'cpc':k.get('cpc',0),
        }

sa_kws=set(k.get('keyword','').strip() for k in json.load(open(os.path.join(BASE,'A_competitors','sa_keywords_1000.json'),encoding='utf-8')).get('keywords',[]) if k.get('keyword'))

print('='*90)
print('PULL 1 - CONTENT GAP GLOBAL')
print('='*90)
print(f'Total KW uniques (5 concurrents x 5K) : {len(all_kws):,}')
print(f'KW SA actuels : {len(sa_kws)}')

gap=[]
for kw,comps in all_kws.items():
    if kw in sa_kws: continue
    n_comps=len(comps)
    if n_comps<3: continue
    vols=[c['vol'] for c in comps.values() if c['vol']]
    vol=max(vols) if vols else 0
    if vol<100: continue
    cpcs=[c['cpc'] for c in comps.values() if c['cpc']]
    cpc=max(cpcs) if cpcs else 0
    kds=[c['kd'] for c in comps.values() if c['kd'] is not None]
    kd=min(kds) if kds else 0
    best_pos=999; best_comp=''
    for comp,c in comps.items():
        if c['pos'] and c['pos']<best_pos:
            best_pos=c['pos']; best_comp=comp
    score=n_comps*10+math.log10(max(vol,10))*15+max(0,(40-kd))/3+(20 if cpc>=20 else 0)
    gap.append({'kw':kw,'vol':vol,'kd':kd,'cpc':cpc,'n':n_comps,'pos':best_pos,'best':best_comp,'score':round(score,1),'seg':bool(SEG.search(kw)),'comps':','.join(sorted(comps.keys()))})

gap.sort(key=lambda x:-x['score'])
seg_gap=[g for g in gap if g['seg']]
print(f'KW content gap (>=3 comps, SA absent, vol>=100) : {len(gap):,}')
print(f'  dont segment energie : {len(seg_gap):,}')

print('\nTOP 25 CONTENT GAP segment :')
print('  KEYWORD                                          | VOL  | KD | CPC | NB | POS | BEST    | SCORE')
for g in seg_gap[:25]:
    print(f"  {g['kw'][:50]:<50}| {g['vol']:>5}|{g['kd']:>3}|{g['cpc']:>4}|{g['n']}/5 | #{g['pos']:<3}| {g['best'][:8]:<8}| {g['score']}")

# Pull 2 — Paid intel
print('\n\n'+'='*90)
print('PULL 2 - PAID INTELLIGENCE')
print('='*90)
for comp in ['effy','travaux','engiehs']:
    p=os.path.join(BASE,'A_competitors',comp,'paid_pages.json')
    if not os.path.exists(p): continue
    data=json.load(open(p,encoding='utf-8'))
    pages=data.get('pages',[])
    seg_pages=[pg for pg in pages if SEG.search(pg.get('url',''))]
    total_kw=sum(pg.get('keywords',0) for pg in pages)
    seg_kw=sum(pg.get('keywords',0) for pg in seg_pages)
    print(f'\n--- {comp.upper()} : {len(pages)} paid pages | {total_kw:,} KW achetees')
    print(f'    Pages segment : {len(seg_pages)} | KW segment achetees : {seg_kw:,}')
    print(f'    TOP 12 PAID URLs (par KW achetees) :')
    seg_pages.sort(key=lambda x:-x.get('keywords',0))
    for pg in seg_pages[:12]:
        url=pg.get('url','').replace('https://www.','').replace('https://','')[:80]
        print(f"      {pg.get('keywords',0):>4} KW | {url}")

out_gap=os.path.join(BASE,'content_gap_global_2026-05.csv')
with open(out_gap,'w',newline='',encoding='utf-8') as f:
    w=csv.writer(f)
    w.writerow(['keyword','volume','kd','cpc','n_comps','best_competitor','best_position','score','segment','comps_present'])
    for g in gap[:1000]:
        w.writerow([g['kw'],g['vol'],g['kd'],g['cpc'],g['n'],g['best'],g['pos'],g['score'],'yes' if g['seg'] else 'no',g['comps']])
print(f'\n>>> CSV gap : {out_gap} = {os.path.getsize(out_gap):,} bytes ({len(gap)} KW)')

out_paid=os.path.join(BASE,'paid_intelligence_2026-05.csv')
with open(out_paid,'w',newline='',encoding='utf-8') as f:
    w=csv.writer(f)
    w.writerow(['competitor','url','keywords_paid','segment_match','url_intent_hint'])
    for comp in ['effy','travaux','engiehs']:
        p=os.path.join(BASE,'A_competitors',comp,'paid_pages.json')
        if not os.path.exists(p): continue
        for pg in json.load(open(p,encoding='utf-8')).get('pages',[]):
            url=pg.get('url','')
            seg='yes' if SEG.search(url) else 'no'
            hint='other'
            if '/lp/' in url: hint='landing_page'
            elif '/devis' in url or '/parcours' in url: hint='funnel_devis'
            elif '/aide' in url or '/prime' in url: hint='aide'
            elif '/travaux' in url or '/installation' in url: hint='travaux'
            elif '/blog' in url or '/magazine' in url: hint='content'
            w.writerow([comp,url,pg.get('keywords',0),seg,hint])
print(f'>>> CSV paid : {out_paid} = {os.path.getsize(out_paid):,} bytes')

# Pull 3 — SA Lost
print('\n\n'+'='*90)
print('PULL 3 - SA LOST KEYWORDS (vs 2026-02-01)')
print('='*90)
sa_diff=json.load(open(os.path.join(BASE,'sa_kw_diff.json'),encoding='utf-8'))
kws_diff=sa_diff.get('keywords',[])
print(f'Total KW SA tracking : {len(kws_diff)}')

lost=[]
for k in kws_diff:
    pos_diff=k.get('best_position_diff') or 0
    traf_diff=k.get('sum_traffic_diff') or 0
    if pos_diff>0 or traf_diff<0:
        lost.append({'kw':k.get('keyword',''),'vol':k.get('volume',0),'pos_now':k.get('best_position') or 999,'pos_diff':pos_diff,'traf_now':k.get('sum_traffic',0),'traf_diff':traf_diff,'url':k.get('best_position_url','')})
lost.sort(key=lambda x:x['traf_diff'])
print(f'KW en perte position/traf : {len(lost)}')

print('\nTOP 15 LOSSES (perte trafic max) :')
for l in lost[:15]:
    print(f"  vol{l['vol']:>5} | traf {l['traf_diff']:>+4} | pos {l['pos_now']} ({l['pos_diff']:>+3}) | {l['kw'][:55]}")

out_lost=os.path.join(BASE,'sa_lost_keywords_2026-05.csv')
with open(out_lost,'w',newline='',encoding='utf-8') as f:
    w=csv.writer(f)
    w.writerow(['keyword','volume','position_now','position_change','traffic_now','traffic_change','url'])
    for l in lost:
        w.writerow([l['kw'],l['vol'],l['pos_now'],l['pos_diff'],l['traf_now'],l['traf_diff'],l['url']])
print(f'\n>>> CSV lost : {out_lost} = {os.path.getsize(out_lost):,} bytes')
