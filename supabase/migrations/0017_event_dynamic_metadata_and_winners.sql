-- Migration 0017: Dynamic Event Metadata, Winners Podium, External Links, Registration Toggles & Category Field Schemas

ALTER TABLE public.events
  ADD COLUMN IF NOT EXISTS external_website_url text,
  ADD COLUMN IF NOT EXISTS winners jsonb DEFAULT '[]'::jsonb,
  ADD COLUMN IF NOT EXISTS requires_registration boolean NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS custom_metadata jsonb DEFAULT '{}'::jsonb;

-- Ensure event_category enum supports 'hackathon' and convert events.category column to text for dynamic categories
DO $$ 
BEGIN
  IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_category') THEN
    ALTER TYPE public.event_category ADD VALUE IF NOT EXISTS 'hackathon';
  END IF;
END $$;

ALTER TABLE public.events ALTER COLUMN category TYPE text USING category::text;

-- Add field_schema column to event_categories table
ALTER TABLE public.event_categories
  ADD COLUMN IF NOT EXISTS field_schema jsonb DEFAULT '[]'::jsonb;

-- Insert or Update Category: Talk & Seminar
INSERT INTO public.event_categories (name, slug, tagline, sort_order, field_schema)
VALUES (
  'Talk & Seminar',
  'talk',
  'Expert keynotes, tech talks, and scientific guest lectures',
  1,
  '[
    {"id": "speaker", "label": "Speaker Name", "type": "text", "placeholder": "e.g. Dr. Jane Doe", "required": false, "hidden": false, "order": 1},
    {"id": "speaker_role", "label": "Speaker Designation", "type": "text", "placeholder": "e.g. Principal AI Researcher", "required": false, "hidden": false, "order": 2},
    {"id": "location", "label": "Location / Venue", "type": "text", "placeholder": "e.g. Main Auditorium / Seminar Hall", "required": false, "hidden": false, "order": 3},
    {"id": "external_website_url", "label": "Presentation Slides / Keynote Link", "type": "url", "placeholder": "https://slides.com/presentation", "required": false, "hidden": false, "order": 4}
  ]'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  field_schema = EXCLUDED.field_schema;

-- Insert or Update Category: Hands-on Workshop
INSERT INTO public.event_categories (name, slug, tagline, sort_order, field_schema)
VALUES (
  'Hands-on Workshop',
  'workshop',
  'Practical technical training, lab experiments, and skill workshops',
  2,
  '[
    {"id": "speaker", "label": "Lead Instructor / Trainer Name", "type": "text", "placeholder": "e.g. Prof. Alan Turing", "required": false, "hidden": false, "order": 1},
    {"id": "speaker_role", "label": "Instructor Title / Affiliation", "type": "text", "placeholder": "e.g. Senior Embedded Systems Engineer", "required": false, "hidden": false, "order": 2},
    {"id": "location", "label": "Lab Room / Workstation Venue", "type": "text", "placeholder": "e.g. Computer Lab 4 / Electronics Workshop", "required": false, "hidden": false, "order": 3},
    {"id": "prerequisites", "label": "Software & Hardware Prerequisites", "type": "prerequisites", "placeholder": "e.g. Laptop with Python 3.11", "required": false, "hidden": false, "order": 4}
  ]'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  field_schema = EXCLUDED.field_schema;

-- Insert or Update Category: IRL Games & Quests (Murder Mysteries, Treasure Hunts, Escape Rooms)
INSERT INTO public.event_categories (name, slug, tagline, sort_order, field_schema)
VALUES (
  'IRL Games & Quests',
  'game',
  'Murder mysteries, campus treasure hunts, escape rooms, and interactive IRL games',
  3,
  '[
    {"id": "speaker", "label": "Game Master / Quest Host Name", "type": "text", "placeholder": "e.g. Science Club Operations Team", "required": false, "hidden": false, "order": 1},
    {"id": "speaker_role", "label": "Game Format & Team Size", "type": "text", "placeholder": "e.g. 4-Member Squads • Campus Clue Quest", "required": false, "hidden": false, "order": 2},
    {"id": "location", "label": "Assembly Point / Starting Venue", "type": "text", "placeholder": "e.g. Central Amphitheatre / Campus Courtyard", "required": false, "hidden": false, "order": 3},
    {"id": "prerequisites", "label": "Required Clue Gear & Items", "type": "prerequisites", "placeholder": "e.g. Smartphone with QR Scanner & Flashlight", "required": false, "hidden": false, "order": 4},
    {"id": "winners", "label": "Winners Podium & Leaderboard", "type": "winners", "placeholder": "Gold, Silver, Bronze podium", "required": false, "hidden": false, "visible_statuses": ["closed", "finished"], "order": 5}
  ]'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  field_schema = EXCLUDED.field_schema;

-- Insert or Update Category: Hackathon & Buildathon
INSERT INTO public.event_categories (name, slug, tagline, sort_order, field_schema)
VALUES (
  'Hackathon & Buildathon',
  'hackathon',
  '24-hour rapid prototyping, software hackathons, and hardware maker builds',
  4,
  '[
    {"id": "speaker", "label": "Hackathon Theme / Focus Domain", "type": "text", "placeholder": "e.g. Open Innovation & AI Solutions", "required": false, "hidden": false, "order": 1},
    {"id": "speaker_role", "label": "Prize Pool & Sprint Format", "type": "text", "placeholder": "e.g. ₹50,000 Total Pool • 24hr Rapid Build", "required": false, "hidden": false, "order": 2},
    {"id": "location", "label": "Hackathon Arena / Lab Room", "type": "text", "placeholder": "e.g. Main Seminar Hall & Hardware Lab", "required": false, "hidden": false, "order": 3},
    {"id": "external_website_url", "label": "Project Submission / Portal Link", "type": "url", "placeholder": "https://devfolio.co/hackathon", "required": false, "hidden": false, "order": 4},
    {"id": "prerequisites", "label": "Required Kit & Tech Stack", "type": "prerequisites", "placeholder": "e.g. Laptop, Git, Microcontroller Kit", "required": false, "hidden": false, "order": 5},
    {"id": "winners", "label": "Winners Podium & Leaderboard", "type": "winners", "placeholder": "Gold, Silver, Bronze podium", "required": false, "hidden": false, "visible_statuses": ["closed", "finished"], "order": 6}
  ]'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  field_schema = EXCLUDED.field_schema;

-- Insert or Update Category: Field Trip & Visit
INSERT INTO public.event_categories (name, slug, tagline, sort_order, field_schema)
VALUES (
  'Field Trip & Visit',
  'trip',
  'Industrial visits, research facility tours, and field expeditions',
  5,
  '[
    {"id": "location", "label": "Destination / Industrial Plant", "type": "text", "placeholder": "e.g. ISRO Telemetry Centre / KSEB Plant", "required": false, "hidden": false, "order": 1},
    {"id": "speaker", "label": "Bus Departure Location & Timing", "type": "text", "placeholder": "e.g. Campus Front Gate @ 07:30 AM", "required": false, "hidden": false, "order": 2},
    {"id": "speaker_role", "label": "Faculty Coordinator & Contact Phone", "type": "text", "placeholder": "e.g. Dr. Ramesh (+91 98765 43210)", "required": false, "hidden": false, "order": 3},
    {"id": "prerequisites", "label": "Safety Gear & Dress Code", "type": "prerequisites", "placeholder": "e.g. Lab Coat & Closed Shoes Required", "required": false, "hidden": false, "order": 4}
  ]'::jsonb
) ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  tagline = EXCLUDED.tagline,
  field_schema = EXCLUDED.field_schema;

-- Seed Sample Execom Industrial Field Trip (Log/History Mode, no registration)
INSERT INTO public.events (
  title, slug, category, event_date, location, speaker, speaker_role, description,
  cover_image_url, is_published, status, requires_registration, custom_metadata
) VALUES (
  'Execom Industrial Visit: ISRO Telemetry Facility',
  'execom-isro-visit-2026',
  'trip',
  '2026-02-15T09:00:00Z',
  'ISRO Telemetry & Tracking Network (ISTRAC)',
  'Execom Delegation',
  'Executive Committee Log',
  'Exclusive industrial visit and laboratory exposure for the Science Club Executive Committee team to inspect satellite tracking systems and telemetry antenna arrays.',
  'https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=1200&auto=format&fit=crop',
  true,
  'finished',
  false,
  '{"Transit Bus": "KSRTC Special Chariot", "Safety Clearance": "Level 2 Badge", "Coordinator": "Prof. David Miller"}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Seed Sample IRL Treasure Hunt Event
INSERT INTO public.events (
  title, slug, category, event_date, location, speaker, speaker_role, description,
  cover_image_url, is_published, status, requires_registration, winners, custom_metadata
) VALUES (
  'ASIET Campus Treasure Hunt: The Lost Cipher',
  'campus-treasure-hunt-2026',
  'game',
  '2026-01-20T10:00:00Z',
  'Central Amphitheatre & Campus Grounds',
  'Science Club Operations Team',
  '4-Member Squads • Clue Quest Format',
  'An immersive real-life campus mystery game where teams cracked cryptographic clues, solved physical puzzles, and unlocked secret campus locations to discover the Lost Cipher.',
  'https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop',
  true,
  'finished',
  true,
  '[{"rank": "1st Place (Gold)", "name": "The Cipher Seekers", "prize": "₹10,000 + Trophy"}, {"rank": "2nd Place (Silver)", "name": "Enigma Hunters", "prize": "₹5,000"}, {"rank": "3rd Place (Bronze)", "name": "Byte Detectives", "prize": "₹2,500"}]'::jsonb,
  '{"Clue Map": "Encrypted Map Provided at Start", "Game Duration": "3 Hours", "Emergency Call": "+91 98765 00000"}'::jsonb
) ON CONFLICT (slug) DO NOTHING;

-- Seed Sample Hackathon Event
INSERT INTO public.events (
  title, slug, category, event_date, location, speaker, speaker_role, description,
  cover_image_url, is_published, status, requires_registration, winners, custom_metadata
) VALUES (
  'ASIET Hackathon & Rapid Buildathon 2026',
  'asiet-hackathon-2026',
  'hackathon',
  '2026-03-10T09:00:00Z',
  'Main Seminar Hall & Computer Labs',
  'Open Innovation & AI Solutions',
  '₹50,000 Total Pool • 24hr Rapid Build',
  'Annual 24-hour inter-college software and hardware prototyping hackathon. Teams build real-world AI, web, and IoT applications from scratch under expert mentorship.',
  'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?q=80&w=1200&auto=format&fit=crop',
  true,
  'finished',
  true,
  '[{"rank": "1st Place (Gold)", "name": "Team Neural Forge", "prize": "₹25,000 + Trophy"}, {"rank": "2nd Place (Silver)", "name": "Quantum Builders", "prize": "₹15,000"}, {"rank": "3rd Place (Bronze)", "name": "Maker Squad", "prize": "₹10,000"}]'::jsonb,
  '{"Portal": "devfolio.co/asiet-build", "Mentors": "12 Industry Experts", "Food & Rest": "Provided 24/7"}'::jsonb
) ON CONFLICT (slug) DO NOTHING;
