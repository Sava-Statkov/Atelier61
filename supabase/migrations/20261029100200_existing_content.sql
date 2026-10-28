-- The content that was hard-coded in src/content/artworks.ts and series.ts, moved into the database.
-- Real data only: nothing here is invented, and the development stand-ins ("Място за творба N")
-- are not carried over.

-- Categories: the kinds of work named in the artist's biography (source: epoch-2025-sharzhove).
insert into public.categories (name, slug, sort_order) values
  ('Живопис', 'zhivopis', 1),
  ('Акварел', 'akvarel', 2),
  ('Графика', 'grafika', 3),
  ('Рисунка', 'risunka', 4),
  ('Шарж', 'sharzh', 5),
  ('Комикс', 'komiks', 6),
  ('Стъклопис', 'staklopis', 7),
  ('Сценография', 'stsenografiya', 8),
  ('Илюстрация', 'ilyustratsiya', 9);

-- Cycles, in the order of the home page. Their sourced facts, quotes and presentation stay in
-- src/content/series.ts, matched by slug. "risuvane-na-zhivo" is a practice (a way of working),
-- marked as such there.
insert into public.cycles (name, slug, description, sort_order) values
  ('Каменната книга на България', 'kamennata-kniga-na-balgariya',
   'Живописен цикъл, представен през 2007 г. в Националния археологически институт с музей при БАН.', 1),
  ('Исторически шаржове на прехода', 'sharzhove-na-prehoda',
   'Шаржове с туш и перо, а по-късно и в цвят, на политици и публични личности от годините на прехода.', 2),
  ('Танц', 'tanc',
   'Четиридесет пана с човешки фигури в движение, показани в галерия „Нирвана“ в София през есента на 2024 г.', 3),
  ('Януарски коне', 'yanuarski-kone',
   'Акварели с коне в различни цветове, ходове и състояния. Първата му изложба, посветена на коне, в галерия Heritage в София.', 4),
  ('Послание към света', 'poslanie-kam-sveta',
   'Мащабен графичен проект, представен през 1993 г.', 5),
  ('Портрети на исторически личности', 'portreti',
   'Живописни цикли с психологически портрети: Моцарт, Шекспир, Салвадор Дали, Нострадамус, Ванга, Св. Никола и други.', 6),
  ('Рисуване на живо с музика', 'risuvane-na-zhivo',
   'Художникът рисува на сцената, докато музикантите свирят. От 2024 г. тези концерти са в основата на фестивала „Музикални зографи“.', 7);

-- „Конник“: an oil painting of „Каменната книга на България“ (source: bnr-2026-kone). It hung in the
-- centre of the exhibition „Януарски коне“ (2026); that is an exhibition, recorded in exhibitions.ts,
-- not a second cycle. Year and size are not known yet.
insert into public.artworks (title, slug, category_id, cycle_id, technique, sources, published)
select 'Конник', 'konnik', c.id, y.id, 'масло', array['bnr-2026-kone'], true
from public.categories c, public.cycles y
where c.slug = 'zhivopis' and y.slug = 'kamennata-kniga-na-balgariya';

insert into public.artworks (title, slug, sources, note, published) values
  ('Окото на света', 'okoto-na-sveta', array['epoch-2025-sharzhove'],
   'Известни са само заглавието и връзката с асамблеята на НАТО през 1998 г. Техника, година и размер липсват.', true);

-- „Конник“ was the cover of its cycle.
update public.cycles
set featured_artwork_id = (select id from public.artworks where slug = 'konnik')
where slug = 'kamennata-kniga-na-balgariya';
