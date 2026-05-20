// NL-primary string table. Keys match screen sections from the plan §7.
// All user-visible copy lives here — no strings in screen templates.

export const STRINGS: Record<string, string> = {
  // ── start ─────────────────────────────────────────────────────────────
  'start.lead':               'Voer je kenteken in om de route van vandaag te laden',
  'start.glasses_hint':       'Tik op het kenteken om in te vullen, daarna Start',
  'start.plate_tap':          'Tik om kenteken in te vullen',
  'start.placeholder':        'AB-123-C',
  'start.voice_hint':         "Zeg 'volgende stop' om te navigeren",
  'start.settings_title':     'Assistent instellingen',
  'start.lang_label':         'Taal / Language',
  'menu.exp.section':         'Ervaringsniveau',
  'btn.menu.close':           'Menu sluiten',
  'start.tier_label':         'Beginner',
  'btn.start_bezorging':      'Start bezorging',
  'btn.start_short':          'Start',

  // ── kenteken (bus laden) ───────────────────────────────────────────────
  'kenteken.title':           'Bus laden',
  'kenteken.plate':           'AB-123-C',
  'kenteken.dock':            'Dock-6',
  'kenteken.scan_label':      'Scannen',
  'kenteken.count':           '1 / 150',
  'kenteken.status_label':    'Status:',
  'kenteken.package_code':    '3SCD80340225',
  'kenteken.voice_hint':      "Zeg 'volgende stop' om te navigeren",
  'btn.start_laden':          'Start laden',
  'btn.start_laden_short':    'Start',

  // ── scan ──────────────────────────────────────────────────────────────
  'scan.title':               'Scannen',
  'scan.count':               '1 / 150',
  'scan.package_code':        '3SCD80340225',
  'scan.hint_glasses':        'Druk op Enter om te bevestigen',
  'scan.hint_lab':            'Houd barcode voor camera',
  'scan.status.label':        'Status:',
  'scan.voice.hint':          'Plaats pakket in de bus',

  // ── scan-error ────────────────────────────────────────────────────────
  'scan_error.title':         'Scannen',
  'scan_error.message':       'Probeer opnieuw',
  'btn.scan_retry':           'Opnieuw scannen',

  // ── laden ─────────────────────────────────────────────────────────────
  'laden.title':              'Plaatsing in bus',
  'laden.placed_label':       'Geplaatst',
  'laden.count':              '1 / 150',
  'laden.address':            'Keesomstraat 10e',
  'laden.position':           '12 / 40',
  'laden.row':                'B',
  'laden.position_in_row':    '1',
  'laden.package_code':       '3SCD80340225',
  'laden.row_label':          '12 / 40 B',
  'btn.pkg_placed':           'Pakket geplaatst',

  // ── route ─────────────────────────────────────────────────────────────
  'route.title':              'Route van vandaag',
  'route.tab_todo':           'Te doen',
  'route.tab_invan':          'In de bus',
  'route.tab_done':           'Gedaan',
  'route.voice_prefix':       'Duim omhoog of zeg ',
  'route.voice_em':           '"start route"',
  'btn.route_start':          'Start bezorging',

  // ── zoek ──────────────────────────────────────────────────────────────
  'zoek.title':               'Zoeken in de bus',
  'zoek.address':             'Keesomstraat 10e',
  'zoek.position':            '12 / 40',
  'zoek.row':                 'B',
  'zoek.position_in_row':     '1',
  'zoek.package_code':        '3SCD80340225',
  'zoek.chip':                'zoeken in bus',
  'zoek.row_label':           'Rij-indeling bus',
  'zoek.row_legend':          'A / B / C',
  'btn.pkg_confirmed':        'Pakket gevonden',

  // ── thuis ─────────────────────────────────────────────────────────────
  'thuis.title':              'Afleveren',
  'thuis.address':            'Keesomstraat 10e',
  'thuis.position':           '1',
  'thuis.package_code':       '3SCD80340225',
  'thuis.voice_hint':         "Zeg 'volgende stop' om te navigeren",
  'btn.ja_thuis':             'Ja, thuis',
  'btn.niet_thuis':           'Niet thuis',

  // ── bevestigen ────────────────────────────────────────────────────────
  'bevestigen.title':         'Bezorging bevestigen',
  'bevestigen.voice_hint':    "Zeg 'volgende stop' om te navigeren",
  'bevestigen.address':       'Keesomstraat 10e',
  'bevestigen.success':       'Bevestigd',
  // Figma typo "Scan opniew" is corrected here:
  'btn.bevestigen':           'Bevestigen',
  'btn.foto':                 'Foto',
  'btn.handtekening':         'Handtekening',
  'btn.scan_opnieuw':         'Scan opnieuw',
  'btn.delivery_confirm':     'Bezorging bevestigen',
  'btn.sign_confirm':         'Handtekening bevestigen',
  'confirm.grid.hint':        'Duim omhoog of zeg "keuze...."',
  'confirm.grid.hint_lead':   'Duim omhoog of zeg ',
  'confirm.grid.hint_em':     '"keuze...."',
  'confirm.summary.hint':     "Zeg 'volgende stop' om te navigeren",
  'confirm.sign.instruction': 'Laat de ontvanger hieronder tekenen',
  'confirm.sign.canvas_hint': 'Teken hier →',
  'confirm.sign.hint':        'Zeg "klaar" als de ontvanger klaar is',
  'confirm.rescan.hint':      'Zeg "scan" of houd de barcode voor de camera',
  'confirm.rescan.title':     'Opnieuw scannen',
  'confirm.photo.confirmed':  'Bezorging bevestigd',
  'confirm.photo.sub':        'Foto opgeslagen als bewijs',
  'rescan.status':            'Scan de barcode van het pakket…',
  'rescan.result.title':      'Barcode geverifieerd',
  'btn.neighbor.confirm':     'Bezorgd bij buurman',
  'niet_thuis.later_sub':     'Vandaag of morgen opnieuw',
  'sp.anders_sub':            'Eigen plek kiezen',
  'sp.guide.default':         'Leg het pakket neer op de gekozen plek.',
  'sp.guide.place':           'Leg het pakket neer bij {place}.',
  'sp.place.confirm':         'Pakket veilig neergelegd?',
  'sp.delivered.status':      'Veilig neergelegd',
  'sp.delivered.place':       'Locatie',
  'btn.sp.pick.next':         'Volgende',
  'btn.sp.photo':             'Foto maken & bevestigen',
  'punt.notice':              'Ontvanger krijgt automatisch een digitale ophaalmelding.',

  // ── niet-thuis ────────────────────────────────────────────────────────
  'niet_thuis.title':         'Niemand thuis',
  'niet_thuis.buren_label':   'Buren',
  'niet_thuis.buren_sub':     'Afgeven bij de buren',
  'niet_thuis.veilig_label':  'Veilige plek',
  'niet_thuis.veilig_sub':    'Achterlaten op locatie',
  'niet_thuis.punt_label':    'PostNL Punt',
  'niet_thuis.punt_sub':      'Dichtstbijzijnde locatie',
  'niet_thuis.later_label':   'Later bezorgen',
  'niet_thuis.voice_prefix':  'Zeg ',
  'niet_thuis.voice_em':      '"buren" of "later"',

  // ── buren ─────────────────────────────────────────────────────────────
  'buren.title':              'Afgeven buren',
  'buren.address':            'Keesomstraat 10e 1821 BS Alkmaar',
  'buren.left_label':         'Nr. 100',
  'buren.left_dir':           'Linker buren',
  'buren.right_label':        'Nr. 104',
  'buren.right_dir':          'Rechter buren',
  'btn.buren_bevestigen':     'Bevestigen',
  'buren.nr_prefix':          'Nr.',

  // ── veiligeplek ───────────────────────────────────────────────────────
  'veiligeplek.title':        'Veilige plek',
  'veiligeplek.address':      'Keesomstraat 10e 1821 BS Alkmaar',
  'veiligeplek.address_short': 'Keesomstraat 10e',
  'veiligeplek.voice_prefix': 'Zeg ',
  'veiligeplek.voice_em':     '"keuze…"',
  'veiligeplek.voice_hint':   "Zeg locatienaam, dan 'foto' of 'bevestig'",
  'sp.voordeur':              'Voordeur',
  'sp.achtertuin':            'Achtertuin',
  'sp.fietsenstalling':       'Fietsenstalling',
  'sp.anders':                'Anders...',
  'btn.veiligeplek_confirm':  'Bevestigen',

  // ── punt ──────────────────────────────────────────────────────────────
  'punt.title':               'PostNL Punt',
  'punt.name':                'Bruna Alkmaar Centrum',
  'punt.address':             'Langestraat 76, Alkmaar',
  'punt.distance':            '0.4 km',
  'punt.distance_label':      'Afstand',
  'punt.closes':              '18:00',
  'punt.closes_label':        'Sluit om',
  'punt.drive':               '-3 min',
  'punt.drive_label':         'Rijden',
  'btn.punt_navigeer':        'Navigeer',
  'btn.punt_bevestigen':      'Afgeven buren',

  // ── later ─────────────────────────────────────────────────────────────
  'later.title':              'Later bezorgen',
  'later.today_label':        'Vandaag opnieuw',
  'later.today_sub':          'Later vandaag terugkomen',
  'later.tomorrow_label':     '2e bezorgingpoging',
  'later.tomorrow_sub':       'Morgen een nieuwe afspraak',
  'later.voice_prefix':       'Zeg ',
  'later.voice_em':           '"vandaag" of "Retour"',
  'btn.later_bevestigen':     'Bevestigen',
  'btn.niemand_thuis':        'Niemand thuis',

  // ── compliments (tier-adaptive) ───────────────────────────────────────
  // Beginner: long, supportive sentence — read aloud + shown in banner.
  // Experienced: terse confirmation, read aloud, banner hidden by tier.css.
  // Pro: empty → silence. Speed beats encouragement at the pro tier.
  'compliment.placed':              'Goed gedaan! Pakket op de juiste plek.',
  'compliment.placed.beginner':     'Helemaal goed — pakket netjes geplaatst.',
  'compliment.placed.experienced':  'Geplaatst.',
  'compliment.placed.pro':          '',

  'compliment.all.loaded':              'Top! Alle pakketten ingeladen. Goed bezig!',
  'compliment.all.loaded.beginner':     'Alle pakketten zijn ingeladen. Perfect — je kunt de route bekijken en vertrekken.',
  'compliment.all.loaded.experienced':  'Bus geladen.',
  'compliment.all.loaded.pro':          'Klaar.',

  'compliment.parcel.found':              'Juist pakket gevonden! Lopen maar.',
  'compliment.parcel.found.beginner':     'Goed gedaan — pakket gevonden. Loop naar het bezorgadres.',
  'compliment.parcel.found.experienced':  'Gevonden.',
  'compliment.parcel.found.pro':          '',

  'compliment.delivered':              'Bezorging gelukt! Super gedaan.',
  'compliment.delivered.beginner':     'Die bezorging is succesvol afgerond. Goed gedaan!',
  'compliment.delivered.experienced':  'Bevestigd.',
  'compliment.delivered.pro':          'Bevestigd.',

  'compliment.safeplace':              'Pakket veilig neergelegd. Goed gedaan!',
  'compliment.safeplace.beginner':     'Pakket veilig neergelegd. Goed gedaan!',
  'compliment.safeplace.experienced':  'Veilige plek bevestigd.',
  'compliment.safeplace.pro':          '',

  'compliment.neighbor':              'Afgeleverd bij de buren. Goed geregeld!',
  'compliment.neighbor.beginner':     'Afgeleverd bij de buren. Goed geregeld!',
  'compliment.neighbor.experienced':  'Buren bevestigd.',
  'compliment.neighbor.pro':          '',

  'compliment.locker':              'Pakket bij het PostNL Punt. Prima werk!',
  'compliment.locker.beginner':     'Pakket bij het PostNL Punt. Prima werk!',
  'compliment.locker.experienced':  'PostNL Punt bevestigd.',
  'compliment.locker.pro':          '',

  // ── return / complete / feedback ────────────────────────────────────
  'return.title':                   'Terug naar bus',
  'return.stat.walk':               '50 meter',
  'return.stat.drive':              '~6 min',
  'return.stat.drive_label':        'Naar stop',
  'return.stat.next_label':         'Volgende',
  'btn.return.to.van':              'Terug naar bus',

  'return.feedforward':             'Stop afgerond. Terug naar de bus. Volgende: {addr}.',
  'return.feedforward.beginner':    'Goed gedaan! {n} stop afgerond. Loop terug naar de bus. Volgende stop: {addr}.',
  'return.feedforward.experienced': '{n} klaar. Terug naar bus. Volgende: {addr}.',
  'return.feedforward.pro':         'Terug bus. Volgende stop.',

  'feedback.delivery.ok':           'Aflevering bevestigd.',
  'feedback.delivery.ok.beginner':  'Die bezorging is succesvol afgerond. Goed gedaan.',
  'feedback.delivery.ok.experienced': 'Bevestigd.',
  'feedback.delivery.ok.pro':       'Bevestigd.',

  'feedback.next.stop':             'Volgende stop.',
  'feedback.next.stop.beginner':    'De volgende stop wordt nu gestart.',
  'feedback.next.stop.experienced': 'Volgende stop.',
  'feedback.next.stop.pro':         'Volgende stop klaar.',

  'feedback.handoff.ok':            'Afgifte geregistreerd.',
  'feedback.handoff.ok.beginner':   'Mooi gedaan — afgifte geregistreerd.',
  'feedback.handoff.ok.experienced': 'Geregistreerd.',
  'feedback.handoff.ok.pro':        'Bevestigd.',

  'voice.locker.receipt':           'Bon afgedrukt. Pakket verstuurd naar PostNL punt.',
  'voice.locker.receipt.pro':       'Bon afgedrukt.',

  'voice.later.today':              'Stop overgeslagen. Later vandaag terugkomen. Doorgaan met de route.',
  'voice.later.today.beginner':     'Stop overgeslagen. Later vandaag terugkomen. Doorgaan met de route.',
  'voice.later.tomorrow':           'Tweede bezorgpoging gepland voor morgen.',
  'voice.later.tomorrow.beginner':  'Tweede bezorgpoging gepland voor morgen.',

  'voice.route.complete':           'Route voltooid.',
  'voice.route.complete.beginner':  'Route voltooid.',
  'voice.route.complete.pro':       'Route voltooid.',

  'complete.title':                 'Route voltooid',
  'complete.sub':                   'Alle pakketten verwerkt voor vandaag',
  'complete.stat.deliveries':       'Bezorgingen',
  'complete.stat.walked':           'Gelopen',
  'complete.stat.success':          'Geslaagd',
  'complete.hint':                  'Zeg "opnieuw" om de demo te herstarten',
  'complete.hint_lead':             'Zeg ',
  'complete.hint_em':               '"opnieuw"',
  'complete.hint_tail':             ' om de demo te herstarten',
  'btn.complete.restart':           'Opnieuw starten',

  'locker.find.chip':               'Zoek in bus',
  'locker.find.sub':                'Haal het pakket uit de bus voor je naar het PostNL Punt gaat.',
  'locker.place.title':             'Plaatsen in parcel locker',
  'locker.place.sub':               'Leg het pakket in het locker-vak en scan daarna de barcode op het label.',
  'locker.btn.navigate':            'Navigeer',
  'locker.btn.to.find':             'Zoek pakket in bus',
  'locker.btn.pakket_meegenomen':   'Pakket meegenomen',
  'locker.btn.scan':                'Scan barcode',
  'locker.scan.status':             'Locker scannen…',
  'btn.locker.confirm':             'Bon afdrukken & bevestigen',
};

export function substitute(key: string, vars: Record<string, string>): string {
  let text = STRINGS[key] ?? key;
  for (const [k, v] of Object.entries(vars)) {
    text = text.replace(new RegExp(`\\{${k}\\}`, 'g'), v);
  }
  return text;
}

export function t(key: string): string {
  return STRINGS[key] ?? key;
}
