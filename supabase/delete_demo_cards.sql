-- Remove auto-generated Oceniator demo cards from Supabase.
-- Demo cards from seed.js used numeric-looking IDs converted to deterministic UUIDs
-- by fallbackUuid() before insert. They have demo notes and dates from the demo set.
--
-- Run in Supabase Dashboard -> SQL Editor.

delete from public.assessments
where assessment_date in (
  date '2025-01-17',
  date '2025-02-21',
  date '2025-04-08',
  date '2025-05-16',
  date '2025-07-09',
  date '2025-08-22',
  date '2025-09-18',
  date '2025-10-24',
  date '2025-12-05',
  date '2026-05-04'
)
and (
  contact_ids::text like '%CALL-%'
  or contact_ids::text like '%MAIL-%'
  or contact_ids::text like '%SYS-%'
  or notes->>'general' in (
    'Wynik do omówienia na najbliższym spotkaniu 1:1.',
    'Widoczna poprawa jakości w porównaniu do poprzedniego okresu.',
    'Do utrzymania standard komunikacji i kompletność zapisów.',
    'Warto dopracować konsekwencję w dokumentowaniu spraw.'
  )
);

-- If this is still a clean setup and you want to remove every assessment,
-- use this manually instead:
-- delete from public.assessments;
