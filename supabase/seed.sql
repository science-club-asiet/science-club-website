-- ============================================================================
-- Science Club — seed data (run AFTER 0001_init.sql)
--
-- Loads the current UI's content into the new SRS-aligned schema so the
-- DB-backed site renders like today. Reconciliations:
--   • People → one `execom_members` table (23 current @ term 2025-26 + 12 past).
--     Dr. Rajan K. is role_type 'faculty_advisor'; `teams` keeps the home
--     carousel's team copy. PAST_EXECOM's 90 "Member N" filler rows dropped.
--   • Events adopt SRS shape: category talk/workshop/game/trip, single
--     event_date (upcoming/finished derived). The 3 formerly-"UPCOMING" events
--     are dated in the future so they still read as upcoming; the 3 "COMPLETED"
--     stay in 2025. member/non_member price seeded 0 (free) — set real prices
--     in admin. Old CONFERENCE/SEMINAR both map to 'talk'.
--   • News → `posts` (type 'news', status 'published').
--   • Execom candids → a `media_album`.
--   • A demo "Default Event Registration" form is created and linked to the
--     AI Horizons event (with a registration_code) to show the form+code wiring.
--
-- ⚠️  Re-running TRUNCATEs the content tables below — including event_registrations
--    and form_submissions via cascade. Safe for initial/dev seeding; do NOT run
--    against production data you care about.
-- ============================================================================

truncate
  public.teams, public.execom_members, public.events, public.event_registrations,
  public.media_albums, public.media_images, public.posts, public.forms,
  public.form_fields, public.form_submissions, public.pillars, public.goals,
  public.impact_stories, public.story_eras, public.perks, public.faqs,
  public.achievements, public.site_content
  restart identity cascade;

-- ─── teams ──────────────────────────────────────────────────────────────────
insert into public.teams (slug, label, name, tagline, description, sort_order) values
  ('core',                '01', $$Core Team$$,           $$The heart of it all.$$,                    $$The core team steers the vision, handles the structure, and makes sure every other team has what they need to succeed.$$, 0),
  ('tech',                '02', $$Technical$$,           $$Where ideas become code.$$,                $$Builders, engineers and tinkerers. They own every line of code, every circuit, and every prototype the club ships.$$, 1),
  ('media',               '03', $$Media$$,               $$Every frame, a story.$$,                    $$The team putting the club's work into the world — through photography, video, design and social storytelling.$$, 2),
  ('events',              '04', $$Events$$,              $$We make it happen.$$,                       $$Logistics, outreach, sponsorship and on-ground execution. They turn every big idea into a live experience.$$, 3),
  ('mentors',             '05', $$Mentors & Advisors$$,  $$Guiding wisdom, inspiring tomorrows.$$,    $$Experienced senior advisors and alumni offering strategic guidance, technical mentorship, and industry perspective to empower student innovators.$$, 4),
  ('design',              '06', $$Design Labs$$,         $$Crafting elegance out of complexity.$$,   $$UI/UX, visual brand identities, and creative design systems. They shape the aesthetic language and user experience across all club initiatives.$$, 5),
  ('innovation-and-stem', '07', $$Innovation & STEM$$,   $$Pioneering new frontiers in science.$$,  $$Spearheading interdisciplinary physical science research, STEM outreach, and experimental technology projects to inspire future scientists.$$, 6);

-- ─── execom_members (current term 2025-26) ──────────────────────────────────
insert into public.execom_members (name, position, role_type, team_slug, term, bio, photo_url, display_order) values
  ($$Dr. Rajan K.$$, $$Faculty Advisor$$, 'faculty_advisor', 'core', $$2025-26$$, $$15+ years guiding student science projects at ASIET. Expert in applied electronics.$$, $$https://i.pravatar.cc/150?img=51$$, 0),
  ($$Arjun Menon$$,  $$Chairperson$$,   'student', 'core', $$2025-26$$, $$Led the club to 3 consecutive national awards. Focused on cross-disciplinary tech.$$, $$https://i.pravatar.cc/150?img=11$$, 1),
  ($$Priya Nair$$,   $$Vice Chair$$,    'student', 'core', $$2025-26$$, $$Coordinating cross-team strategy and outreach. Former events head.$$, $$https://i.pravatar.cc/150?img=45$$, 2),
  ($$Rohan Das$$,    $$Secretary$$,     'student', 'core', $$2025-26$$, $$Keeps the minutes, keeps the peace, and ensures zero operational bottlenecks.$$, $$https://i.pravatar.cc/150?img=12$$, 3),
  ($$Sneha Pillai$$, $$Treasurer$$,     'student', 'core', $$2025-26$$, $$Manages grants, budgets and sponsorship funds with absolute precision.$$, $$https://i.pravatar.cc/150?img=47$$, 4),
  ($$Aditya Raj$$,   $$Jt. Secretary$$, 'student', 'core', $$2025-26$$, $$Liaises between departments and schedules all technical workshops.$$, $$https://i.pravatar.cc/150?img=13$$, 5),
  ($$Kiran Kumar$$,  $$Tech Lead$$,     'student', 'tech', $$2025-26$$, $$Full-stack wizard with a love for low-level systems and embedded C.$$, $$https://i.pravatar.cc/150?img=14$$, 0),
  ($$Anjali Seth$$,  $$Backend Dev$$,   'student', 'tech', $$2025-26$$, $$Designs APIs that power everything behind the scenes. Node.js expert.$$, $$https://i.pravatar.cc/150?img=46$$, 1),
  ($$Dev Prakash$$,  $$Frontend Dev$$,  'student', 'tech', $$2025-26$$, $$Turns Figma files into buttery-smooth experiences with React and GSAP.$$, $$https://i.pravatar.cc/150?img=15$$, 2),
  ($$Mehak Gupta$$,  $$AI/ML Lead$$,    'student', 'tech', $$2025-26$$, $$Training models by night, explaining them by day. Computer vision specialist.$$, $$https://i.pravatar.cc/150?img=48$$, 3),
  ($$Rahul Varma$$,  $$Hardware Lead$$, 'student', 'tech', $$2025-26$$, $$Oscilloscope always in hand, PCB always in progress. Robotics enthusiast.$$, $$https://i.pravatar.cc/150?img=16$$, 4),
  ($$Tara Bose$$,    $$Research Lead$$, 'student', 'tech', $$2025-26$$, $$Papers submitted, patents pending — always curious about the next frontier.$$, $$https://i.pravatar.cc/150?img=49$$, 5),
  ($$Nisha Thomas$$, $$Media Head$$,    'student', 'media', $$2025-26$$, $$Visual director with an eye for cultural nuance and minimalist design.$$, $$https://i.pravatar.cc/150?img=44$$, 0),
  ($$Jay Krishnan$$, $$Photographer$$,  'student', 'media', $$2025-26$$, $$Captures the raw energy in every lab setting and large-scale event.$$, $$https://i.pravatar.cc/150?img=17$$, 1),
  ($$Anika Roy$$,    $$Video Editor$$,  'student', 'media', $$2025-26$$, $$Cuts content that makes people actually watch twice. Premiere Pro wizard.$$, $$https://i.pravatar.cc/150?img=50$$, 2),
  ($$Sam Philip$$,   $$Content Writer$$,'student', 'media', $$2025-26$$, $$Turns complex science into engaging, readable narratives for the masses.$$, $$https://i.pravatar.cc/150?img=18$$, 3),
  ($$Riya Sharma$$,  $$Social Media$$,  'student', 'media', $$2025-26$$, $$Grew the club's organic reach by 400% in a single semester.$$, $$https://i.pravatar.cc/150?img=43$$, 4),
  ($$Maya Iyer$$,    $$Events Head$$,   'student', 'events', $$2025-26$$, $$Orchestrated 12 events with zero day-of failures. Master of logistics.$$, $$https://i.pravatar.cc/150?img=42$$, 0),
  ($$Vivek Soni$$,   $$Logistics$$,     'student', 'events', $$2025-26$$, $$Loves a clipboard. Hates a last-minute cancellation. Keeps the trains running.$$, $$https://i.pravatar.cc/150?img=20$$, 1),
  ($$Pooja Reddy$$,  $$Sponsorship$$,   'student', 'events', $$2025-26$$, $$Secured 5 major corporate sponsors in a single semester. Excellent negotiator.$$, $$https://i.pravatar.cc/150?img=41$$, 2),
  ($$Nikhil Babu$$,  $$Outreach$$,      'student', 'events', $$2025-26$$, $$The face the internet sees. Warm, precise, loud. Connects with other colleges.$$, $$https://i.pravatar.cc/150?img=21$$, 3),
  ($$Kavya Menon$$,  $$PR Head$$,       'student', 'events', $$2025-26$$, $$Writes press releases that actually get picked up by local and national news.$$, $$https://i.pravatar.cc/150?img=40$$, 4),
  ($$Aman Singh$$,   $$Hospitality$$,   'student', 'events', $$2025-26$$, $$Ensures every speaker, judge, and attendee leaves with a good memory.$$, $$https://i.pravatar.cc/150?img=22$$, 5);

-- ─── execom_members (past terms — 12 named) ─────────────────────────────────
insert into public.execom_members (name, position, role_type, team_slug, term, photo_url, display_order) values
  ($$Nikhil Sridhar$$, $$Chairperson$$, 'student', 'core', $$2023-24$$, $$https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop$$, 0),
  ($$Megha Nair$$,     $$Vice Chair$$,  'student', 'core', $$2023-24$$, $$https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop$$, 1),
  ($$Vivek Menon$$,    $$Secretary$$,   'student', 'core', $$2023-24$$, $$https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop$$, 2),
  ($$Farah Khan$$,     $$Treasurer$$,   'student', 'core', $$2023-24$$, $$https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop$$, 3),
  ($$Nikhil Sridhar$$, $$Chairperson$$, 'student', 'core', $$2022-23$$, $$https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop$$, 0),
  ($$Megha Nair$$,     $$Vice Chair$$,  'student', 'core', $$2022-23$$, $$https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop$$, 1),
  ($$Vivek Menon$$,    $$Secretary$$,   'student', 'core', $$2022-23$$, $$https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop$$, 2),
  ($$Farah Khan$$,     $$Treasurer$$,   'student', 'core', $$2022-23$$, $$https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop$$, 3),
  ($$Nikhil Sridhar$$, $$Chairperson$$, 'student', 'core', $$2021-22$$, $$https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop$$, 0),
  ($$Megha Nair$$,     $$Vice Chair$$,  'student', 'core', $$2021-22$$, $$https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop$$, 1),
  ($$Vivek Menon$$,    $$Secretary$$,   'student', 'core', $$2021-22$$, $$https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop$$, 2),
  ($$Farah Khan$$,     $$Treasurer$$,   'student', 'core', $$2021-22$$, $$https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop$$, 3);

-- ─── forms (demo default event-registration form) ───────────────────────────
insert into public.forms (title, slug, description, purpose, is_active) values
  ($$Default Event Registration$$, $$event-registration-default$$,
   $$Standard fields collected when a member registers for an event.$$, 'event', true);

insert into public.form_fields (form_id, label, field_key, field_type, required, placeholder, options, display_order)
select f.id, v.label, v.field_key, v.field_type::form_field_type, v.required, v.placeholder, v.options::jsonb, v.display_order
from public.forms f,
  (values
    ($$Full Name$$,      $$full_name$$,     $$text$$,     true,  $$Your full name$$,          $$[]$$,                    0),
    ($$Email$$,          $$email$$,         $$email$$,    true,  $$you@college.edu$$,         $$[]$$,                    1),
    ($$Department$$,     $$department$$,    $$text$$,     false, $$e.g. CSE$$,                $$[]$$,                    2),
    ($$Year of Study$$,  $$year_of_study$$, $$select$$,   false, null,                       $$["1","2","3","4"]$$,     3),
    ($$Why do you want to attend?$$, $$motivation$$, $$textarea$$, false, $$Optional$$,      $$[]$$,                    4)
  ) as v(label, field_key, field_type, required, placeholder, options, display_order)
where f.slug = $$event-registration-default$$;

-- ─── events ─────────────────────────────────────────────────────────────────
-- Upcoming (future-dated so they read as upcoming):
insert into public.events
  (title, slug, category, description, event_date, location, speaker, speaker_role,
   seats_remaining, agenda, prerequisites, cover_image_url,
   registration_form_id, registration_code)
values
  ($$AI Horizons Summit '25$$, $$ai-horizons-summit-25$$, 'talk'::event_category,
   $$Join leading minds in AI research for a full-day summit covering the latest breakthroughs in large language models, computer vision, and AI ethics. Expect keynote speeches, panel discussions, and interactive Q&A sessions.$$,
   $$2026-10-12 09:00:00+05:30$$::timestamptz, $$Main Auditorium, Science Block$$,
   $$Dr. Elena Rostova & Prof. Marcus Chen$$, $$Keynote Researchers, ASIET Research Lab$$, 42,
   $$[{"time":"09:00 AM","title":"Registration & Welcome Coffee","description":"Collect badges and networking."},{"time":"10:00 AM","title":"Keynote: Next Frontier in LLMs","description":"Presented by Dr. Elena Rostova."},{"time":"01:00 PM","title":"Networking Lunch & Poster Session","description":"Student paper poster showcases."},{"time":"02:30 PM","title":"Panel Discussion: AI Ethics & Safety","description":"Interactive session with audience Q&A."},{"time":"04:30 PM","title":"Closing Remarks & Awards","description":"Honoring top student research papers."}]$$::jsonb,
   array[$$Basic understanding of machine learning concepts$$, $$Laptops recommended for interactive sessions$$],
   $$https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80$$,
   (select id from public.forms where slug = $$event-registration-default$$), $$AIHORIZON26$$);

insert into public.events
  (title, slug, category, description, event_date, location, speaker, speaker_role,
   seats_remaining, agenda, prerequisites, cover_image_url) values
  ($$Quantum Computing Hardware$$, $$quantum-computing-hardware$$, 'talk',
   $$A deep dive into the physical architecture of quantum computers. We will explore superconducting qubits, trapped ions, and the engineering challenges of scaling up quantum systems while minimizing decoherence.$$,
   $$2026-10-18 14:00:00+05:30$$::timestamptz, $$Room 402, Physics Dept$$,
   $$Dr. James Aris$$, $$Senior Quantum Physicist$$, 18,
   $$[{"time":"02:00 PM","title":"Introduction to Qubit Physics","description":"Superposition and entanglement principles."},{"time":"03:00 PM","title":"Cryogenic Systems & Control Electronics","description":"Hardware implementations at millikelvin scales."},{"time":"03:45 PM","title":"Q&A & Open Discussion","description":"Future outlook for fault-tolerant quantum computing."}]$$::jsonb,
   array[$$Linear algebra fundamentals$$, $$Basic quantum mechanics principles$$],
   $$https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80$$),

  ($$Autonomous Robotics Build V2$$, $$autonomous-robotics-build-v2$$, 'workshop',
   $$A hands-on workshop where participants will assemble and program autonomous rovers using ROS (Robot Operating System) and basic computer vision for obstacle avoidance.$$,
   $$2026-11-04 10:00:00+05:30$$::timestamptz, $$Engineering Lab 3$$,
   $$Robotics Club Lead$$, $$Core Robotics Team, ASIET$$, 12,
   $$[{"time":"10:00 AM","title":"Hardware Assembly & Microcontrollers","description":"Setting up motor drivers and sensor arrays."},{"time":"11:30 AM","title":"ROS Navigation Stack Configuration","description":"Mapping and localization algorithms."},{"time":"01:30 PM","title":"Obstacle Course Testing Challenge","description":"Testing rovers on a simulated terrain."}]$$::jsonb,
   array[$$Basic Python or C++ programming$$, $$Bring your own laptop (Ubuntu/Linux preferred)$$],
   $$https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80$$),

  ($$Neural Network Research Seminar$$, $$neural-network-research-seminar$$, 'talk',
   $$Review of recent papers on parameter-efficient fine-tuning (PEFT) methods for neural networks, focusing on LoRA and QLoRA.$$,
   $$2025-09-22 18:00:00+05:30$$::timestamptz, $$Virtual (Zoom)$$,
   $$Sarah Jenkins, PhD Candidate$$, $$Machine Learning Researcher$$, null,
   $$[{"time":"06:00 PM","title":"Paper Presentation: PEFT Foundations","description":"Overview of rank decomposition matrices."},{"time":"06:50 PM","title":"Code Walkthrough & Benchmarks","description":"Comparing full fine-tuning vs LoRA efficiency."}]$$::jsonb,
   array[]::text[],
   $$https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80$$),

  ($$Advanced Electronics Architecture$$, $$advanced-electronics-architecture$$, 'workshop',
   $$An intensive session on PCB design and high-frequency circuit architecture using modern CAD tools.$$,
   $$2025-08-14 13:00:00+05:30$$::timestamptz, $$Electronics Lab 1$$,
   $$Prof. David Lin$$, $$Department of Electronics Engineering$$, null,
   $$[{"time":"01:00 PM","title":"High-Frequency PCB Layout Theory","description":"Signal integrity and impedance matching."},{"time":"03:00 PM","title":"KiCad Hands-On Routing Exercise","description":"Routing multi-layer boards."}]$$::jsonb,
   array[]::text[],
   $$https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80$$),

  ($$Astrophysics & Space Observation$$, $$astrophysics-space-observation$$, 'talk',
   $$An evening seminar exploring deep-space imaging, radio astronomy, and processing optical data from orbital telescopes.$$,
   $$2025-07-02 19:00:00+05:30$$::timestamptz, $$Campus Observatory & Room 101$$,
   $$Dr. Alistair Vance$$, $$Observational Astronomer$$, null,
   $$[]$$::jsonb, array[]::text[],
   $$https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80$$);

-- ─── posts (news) ───────────────────────────────────────────────────────────
insert into public.posts (type, status, title, slug, excerpt, body, cover_image_url, tag, breaking, published_at, display_order) values
  ('news', 'published', $$NSF Grant for IoT Architecture$$, $$nsf-grant-for-iot-architecture$$,
   $$Science Club ASIET has officially secured a massive endowment from the National Science Foundation. The funds will be purely injected into the new autonomous cross-mesh IoT grid built by our technical core team.$$,
   $$Science Club ASIET has officially secured a massive endowment from the National Science Foundation. The funds will be purely injected into the new autonomous cross-mesh IoT grid built by our technical core team.$$,
   $$https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop$$, $$ACHIEVEMENTS$$, true, $$2026-03-14 10:00:00+05:30$$::timestamptz, 0),
  ('news', 'published', $$Renewable Energy Thermodynamics$$, $$renewable-energy-thermodynamics$$,
   $$Our thermal dynamics division has successfully finalized a proprietary micro-inverter capable of returning 14% extra payload yield in high-heat thermal zones.$$,
   $$Our thermal dynamics division has successfully finalized a proprietary micro-inverter capable of returning 14% extra payload yield in high-heat thermal zones.$$,
   $$https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?q=80&w=1600&auto=format&fit=crop$$, $$PROJECTS$$, false, $$2026-02-28 10:00:00+05:30$$::timestamptz, 1),
  ('news', 'published', $$Dr. Rajan on Quantum Ethics$$, $$dr-rajan-on-quantum-ethics$$,
   $$A deep dive with our faculty advisor on the moral constraints of unbounded computational speed, and how students must pioneer strict safety protocols inside low-level network architectures.$$,
   $$A deep dive with our faculty advisor on the moral constraints of unbounded computational speed, and how students must pioneer strict safety protocols inside low-level network architectures.$$,
   $$https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1600&auto=format&fit=crop$$, $$INTERVIEW$$, false, $$2026-02-12 10:00:00+05:30$$::timestamptz, 2),
  ('news', 'published', $$Autonomous Swarm Deployment$$, $$autonomous-swarm-deployment$$,
   $$Over 40 students converged on the mechanical wing last weekend for a live-flight calibration session. The entire drone swarm achieved perfect collision vectoring without external GPS.$$,
   $$Over 40 students converged on the mechanical wing last weekend for a live-flight calibration session. The entire drone swarm achieved perfect collision vectoring without external GPS.$$,
   $$https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1600&auto=format&fit=crop$$, $$WORKSHOP$$, false, $$2026-01-05 10:00:00+05:30$$::timestamptz, 3);

-- ─── media (execom candids album) ───────────────────────────────────────────
insert into public.media_albums (title, category, term, cover_image_url, description, display_order)
values ($$Execom Candids$$, $$execom$$, $$2025-26$$,
  $$https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop$$,
  $$Behind-the-scenes moments from the current execom term.$$, 0);

insert into public.media_images (album_id, image_url, caption, display_order)
select a.id, v.image_url, v.caption, v.display_order
from public.media_albums a,
  (values
    ($$https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1200&auto=format&fit=crop$$, $$Hackathon Night 2024 — Student Labs$$, 0),
    ($$https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=1200&auto=format&fit=crop$$, $$Annual Symposium Planning — Seminar Hall$$, 1),
    ($$https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?q=80&w=1200&auto=format&fit=crop$$, $$Robotics Workshop Demo — Physics Lab B$$, 2),
    ($$https://images.unsplash.com/photo-1529156069898-49953e39b3ac?q=80&w=1200&auto=format&fit=crop$$, $$Execom Retreat & Celebration — Outdoor Campus$$, 3),
    ($$https://images.unsplash.com/photo-1523240795612-9a054b0db644?q=80&w=1200&auto=format&fit=crop$$, $$National Championship Win — New Delhi$$, 4),
    ($$https://images.unsplash.com/photo-1556761175-5973dc0f32e7?q=80&w=1200&auto=format&fit=crop$$, $$Cross-disciplinary Brainstorm — Innovation Hub$$, 5)
  ) as v(image_url, caption, display_order)
where a.title = $$Execom Candids$$;

-- ─── pillars (mission) ──────────────────────────────────────────────────────
insert into public.pillars (num, icon, title, short, detail, image, tag, sort_order) values
  ($$01$$, $$Compass$$, $$Curiosity First$$,
   $$Every question is worth asking. Intellectual curiosity is celebrated, never suppressed.$$,
   $$We encourage questions that break conventional course boundaries. Whether exploring quantum computing, autonomous robotics, or synthetic biology, curiosity drives our agenda.$$,
   $$https://images.unsplash.com/photo-1507668077129-56e32842fceb?q=80&w=800&auto=format&fit=crop$$, $$EXPLORATION$$, 0),
  ($$02$$, $$Hammer$$, $$Build, Don't Just Study$$,
   $$Learning accelerates 10× when you make something real. Prototypes and code are our curriculum.$$,
   $$Textbooks give foundation, but building gives understanding. Every member works on tangible prototypes, hardware assemblies, or computational models throughout the year.$$,
   $$https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop$$, $$PROTOTYPING$$, 1),
  ($$03$$, $$Unlock$$, $$Radical Openness$$,
   $$Our research, code, and findings are openly shared with the global scientific community.$$,
   $$Knowledge shouldn't sit behind closed doors. We host open GitHub repositories, publish open-access project documentations, and encourage peer critique.$$,
   $$https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop$$, $$OPEN SOURCE$$, 2),
  ($$04$$, $$Users2$$, $$Zero Hierarchy of Ideas$$,
   $$The best idea wins — regardless of department, year of study, or title.$$,
   $$In Science Club, first-year insights carry equal weight to senior wisdom. We foster an environment where technical logic and evidence always triumph over authority.$$,
   $$https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop$$, $$INCLUSIVITY$$, 3),
  ($$05$$, $$Rocket$$, $$Tangible Execution$$,
   $$We measure progress by completed projects, publications, and real-world demonstrations.$$,
   $$Ideas are only beginnings. We hold ourselves accountable to shipping finished work, entering technical competitions, and hosting public science exhibitions.$$,
   $$https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=800&auto=format&fit=crop$$, $$EXECUTION$$, 4);

-- ─── goals (mission) ────────────────────────────────────────────────────────
insert into public.goals (target_year, title, description, status, progress, category, image, sort_order) values
  ($$2025$$, $$Open-Source Repository Initiative$$, $$Launch centralized public GitHub organization for all Science Club projects, hardware schematics, and research codebases.$$, $$Active Implementation$$, 85, $$Software & Hardware$$, $$https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?q=80&w=800&auto=format&fit=crop$$, 0),
  ($$2026$$, $$Student-Run Fabrication Lab$$, $$Build a dedicated campus facility equipped with 3D printing, PCB rapid prototyping, and sensor validation benches.$$, $$In Progress$$, 60, $$Infrastructure$$, $$https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop$$, 1),
  ($$2026$$, $$Semesterly Peer-Reviewed Papers$$, $$Establish a pipeline enabling at least one student-authored research publication per semester in recognized journals.$$, $$Underway$$, 45, $$Academic Research$$, $$https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=800&auto=format&fit=crop$$, 2),
  ($$2027$$, $$Statewide Inter-College Science Summit$$, $$Establish the largest student-organized inter-college science & engineering festival in Kerala.$$, $$Milestone Target$$, 30, $$Community & Fest$$, $$https://images.unsplash.com/photo-1517976487492-5750f3195933?q=80&w=800&auto=format&fit=crop$$, 3);

-- ─── impact_stories (mission) ───────────────────────────────────────────────
insert into public.impact_stories (quote, author, role, tag, image, sort_order) values
  ($$Joining Science Club allowed me to stop just solving practice exam problems and start building actual embedded hardware. Within six months, our team prototyped a modular environmental sensor array.$$, $$Ananya Nair$$, $$ECE '26 & Hardware Lead$$, $$Hardware Prototype$$, $$https://images.unsplash.com/photo-1581092160607-ee22621dd758?q=80&w=800&auto=format&fit=crop$$, 0),
  ($$I thought publishing research was only for PhD candidates. Here, senior members guided me through dataset preparation and paper drafting. We presented our ML paper in our third semester.$$, $$Rohan Varghese$$, $$CSE '27 & Research Lead$$, $$Peer-Reviewed Paper$$, $$https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop$$, 1);

-- ─── story_eras (about — inline HTML) ───────────────────────────────────────
insert into public.story_eras (year, title, description, img, sort_order) values
  ($$2012$$, $$The Genesis$$, $$A small group of students realized reading about robotics wasn't the same as building one. They commandeered a small lab on a Friday evening and started <span class='font-oswald text-red font-bold uppercase tracking-widest'>tearing things apart</span>.$$, $$https://images.unsplash.com/photo-1532094349884-543bc11b234d?q=80&w=1600&auto=format&fit=crop$$, 0),
  ($$2016$$, $$The Expansion$$, $$What started as weekend tinkering became a full-blown movement. We won our first national competition, proving that our <span class='italic text-red opacity-90'>hands-on, zero-excuses</span> philosophy actually worked.$$, $$https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?q=80&w=1600&auto=format&fit=crop$$, 1),
  ($$2020$$, $$The Network$$, $$Six departments. 100+ active members. We stopped being just a club and became an institution for <span class='underline decoration-red decoration-2 underline-offset-4'>open research</span>, peer mentorship, and cross-disciplinary engineering.$$, $$https://images.unsplash.com/photo-1507413245164-6160d8298b31?q=80&w=1600&auto=format&fit=crop$$, 2),
  ($$NOW$$, $$The Legacy$$, $$38 live projects. 240+ builders. We are the largest intersection of <span class='font-oswald text-navy bg-red px-2 uppercase font-bold tracking-tight'>curiosity and creation</span> on campus. And we are just getting started.$$, $$https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1600&auto=format&fit=crop$$, 3);

-- ─── perks (join) ───────────────────────────────────────────────────────────
insert into public.perks (text, sort_order) values
  ($$Access to all club workshops and seminars$$, 0),
  ($$Membership in active project teams$$, 1),
  ($$Lab access and hardware budget allocation$$, 2),
  ($$Priority placement for inter-college fests$$, 3),
  ($$Certificate of participation for every event$$, 4),
  ($$Networking with alumni in top tech companies$$, 5);

-- ─── faqs (join) ────────────────────────────────────────────────────────────
insert into public.faqs (question, answer, sort_order) values
  ($$Who can join?$$, $$Any student currently enrolled at ASIET — from any department and any semester. We are cross-disciplinary by design.$$, 0),
  ($$Is there a fee?$$, $$There is a nominal annual membership fee of ₹200 that goes directly into our shared components and lab materials budget.$$, 1),
  ($$Do I need prior experience?$$, $$Absolutely not. Many of our best contributors joined with zero technical background. Curiosity is the only prerequisite.$$, 2),
  ($$How do I get onto the Execom?$$, $$Execom applications open each semester. Members who have been active for at least one semester are eligible to apply for any open position.$$, 3);

-- ─── achievements (execom) ──────────────────────────────────────────────────
insert into public.achievements (title, subtitle, icon, sort_order) values
  ($$National Level Robotics Championship 2024$$, $$1ST PLACE WINNER$$, $$Trophy$$, 0),
  ($$Best Institutional Student Chapter Award 2023$$, $$STATEWIDE RECOGNITION$$, $$Award$$, 1),
  ($$50+ Applied Physical Science Workshops$$, $$2023-24 ACADEMIC YEAR$$, $$Cpu$$, 2),
  ($$20+ Research Papers & Student Publications$$, $$PEER REVIEWED$$, $$GraduationCap$$, 3),
  ($$Partnerships with 15+ Industry Research Labs$$, $$SPONSORED PROJECTS$$, $$Globe$$, 4);

-- ─── site_content (singletons) ──────────────────────────────────────────────
insert into public.site_content (key, value) values
  ($$current_term$$, $${"term":"2025-26"}$$::jsonb),
  ($$hero$$, $${"badge":"Spring Symposium 2026","title":"INNOVATE. DISCOVER. CREATE."}$$::jsonb),
  ($$marquee$$, $${"text":"SCIENCE CLUB • INNOVATION • DISCOVERY • COMPUTATION • "}$$::jsonb),
  ($$about_stats$$, $${"stats":[{"value":"240+","label":"Active Members"},{"value":"38","label":"Live Projects"},{"value":"12yrs","label":"Established"},{"value":"6","label":"Departments"}]}$$::jsonb),
  ($$contact$$, $${"email":"hello@asietscience.club","blurb":"Have a question about joining, a partnership proposal, or just want to nerd out about science? Drop us a message.","socials":{"github":"#","linkedin":"#","instagram":"#"}}$$::jsonb),
  ($$location$$, $${"address":"Adi Shankara Institute of Engineering and Technology, Kalady, Kerala - 683574","hours":"Mon - Fri: 9:00 AM - 4:00 PM\nWeekends: Closed (Except Events)","maps_url":"https://maps.app.goo.gl/3q4V3fXzX9Vz4H9Y8","embed_url":"https://www.google.com/maps?q=Adi+Shankara+Institute+of+Engineering+and+Technology,Kalady,Kerala&output=embed"}$$::jsonb),
  ($$footer$$, $${"columns":[{"heading":"Science Club","links":["News","First Team","Club History","Join The Board"]},{"heading":"Explore","links":["My Account","Events & Experiences","Resources","Campus Tour"]},{"heading":"Help","links":["Legal Notice","Privacy Policy","Help Center","Cookie Preferences"]}]}$$::jsonb);
