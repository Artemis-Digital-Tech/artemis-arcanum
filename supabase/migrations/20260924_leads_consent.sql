-- LGPD Art. 8º: consent must be evidenced, not just implied by form submission.
-- This records the moment the explicit checkbox was accepted; the newsletter
-- function refuses to insert without it.
alter table public.leads add column consented_at timestamptz;
