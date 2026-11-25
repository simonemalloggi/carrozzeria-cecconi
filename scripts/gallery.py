# genera il markup della galleria (usato una volta in fase di sviluppo)
items = [
("esterno-ulivo",1360,1020,"La carrozzeria vista dal piazzale"),
("officina-panoramica",1360,765,"L'officina: banchi di riscontro e cabine"),
("cabina-verniciatura-1",1600,1200,"Cabina di verniciatura Spanesi"),
("accoglienza-1",1600,1199,"Area accoglienza clienti"),
("adas-1",1600,1200,"Pannello per la calibrazione ADAS"),
("sollevatori-1",1600,1200,"Postazioni di lavoro con sollevatori"),
("mascotte",900,1490,"Le mascotte di casa davanti all'ufficio"),
("lavorazione-1",1080,789,"SUV sul banco di riscontro"),
("accoglienza-2",1600,1200,"Sala d'attesa"),
("cabina-verniciatura-2",1600,1275,"Ingresso della cabina di verniciatura"),
("adas-2",1080,1130,"Calibrazione ADAS con CSC-Tool Digital"),
("facciata",1360,1020,"La facciata con l'ingresso dell'officina"),
("zona-preparazione",1360,1020,"Zone di preparazione, cabina di verniciatura e tintometro"),
("banco-riscontro",1600,1200,"Sollevatore in cabina di verniciatura"),
("ufficio",1440,1080,"Ufficio e sala preventivi"),
("sollevatori-2",1600,1195,"Area di preparazione"),
("officina-1",1600,1200,"Officina con attrezzatura ADAS"),
("lavorazione-2",943,788,"Riparazione su banco di riscontro"),
("officina-2",1600,1200,"Zona attrezzature e ricambi"),
("piazzale",1360,1020,"Il piazzale con le auto dei clienti"),
]
out=[]
for n,w,h,a in items:
    out.append(f'''        <button type="button" data-full="img/{n}-1600.webp" aria-label="Ingrandisci: {a}"><img src="img/{n}-480.webp" srcset="img/{n}-480.webp 480w, img/{n}-960.webp 960w" sizes="(max-width:640px) 50vw, 300px" width="{w}" height="{h}" alt="{a}" loading="lazy" decoding="async"></button>''')
print("\n".join(out))
