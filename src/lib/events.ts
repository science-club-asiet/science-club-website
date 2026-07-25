export type EventType = "CONFERENCE" | "SEMINAR" | "WORKSHOP";
export type EventStatus = "UPCOMING" | "COMPLETED";

export interface AgendaItem {
  time: string;
  title: string;
  description?: string;
}

export interface ScienceEvent {
  id: string;
  title: string;
  dateDay: string;
  dateMonth: string;
  dateYear?: string;
  type: EventType;
  status: EventStatus;
  img: string;
  description: string;
  speaker?: string;
  speakerRole?: string;
  location?: string;
  time?: string;
  seatsRemaining?: number;
  agenda?: AgendaItem[];
  prerequisites?: string[];
}

export const eventsData: ScienceEvent[] = [
  {
    id: "evt-01",
    title: "AI Horizons Summit '25",
    dateDay: "12",
    dateMonth: "OCT",
    dateYear: "2025",
    type: "CONFERENCE",
    status: "UPCOMING",
    img: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80",
    description: "Join leading minds in AI research for a full-day summit covering the latest breakthroughs in large language models, computer vision, and AI ethics. Expect keynote speeches, panel discussions, and interactive Q&A sessions.",
    speaker: "Dr. Elena Rostova & Prof. Marcus Chen",
    speakerRole: "Keynote Researchers, ASIET Research Lab",
    location: "Main Auditorium, Science Block",
    time: "09:00 AM - 05:00 PM",
    seatsRemaining: 42,
    agenda: [
      { time: "09:00 AM", title: "Registration & Welcome Coffee", description: "Collect badges and networking." },
      { time: "10:00 AM", title: "Keynote: Next Frontier in LLMs", description: "Presented by Dr. Elena Rostova." },
      { time: "01:00 PM", title: "Networking Lunch & Poster Session", description: "Student paper poster showcases." },
      { time: "02:30 PM", title: "Panel Discussion: AI Ethics & Safety", description: "Interactive session with audience Q&A." },
      { time: "04:30 PM", title: "Closing Remarks & Awards", description: "Honoring top student research papers." }
    ],
    prerequisites: ["Basic understanding of machine learning concepts", "Laptops recommended for interactive sessions"]
  },
  {
    id: "evt-02",
    title: "Quantum Computing Hardware",
    dateDay: "18",
    dateMonth: "OCT",
    dateYear: "2025",
    type: "SEMINAR",
    status: "UPCOMING",
    img: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=800&q=80",
    description: "A deep dive into the physical architecture of quantum computers. We will explore superconducting qubits, trapped ions, and the engineering challenges of scaling up quantum systems while minimizing decoherence.",
    speaker: "Dr. James Aris",
    speakerRole: "Senior Quantum Physicist",
    location: "Room 402, Physics Dept",
    time: "02:00 PM - 04:00 PM",
    seatsRemaining: 18,
    agenda: [
      { time: "02:00 PM", title: "Introduction to Qubit Physics", description: "Superposition and entanglement principles." },
      { time: "03:00 PM", title: "Cryogenic Systems & Control Electronics", description: "Hardware implementations at millikelvin scales." },
      { time: "03:45 PM", title: "Q&A & Open Discussion", description: "Future outlook for fault-tolerant quantum computing." }
    ],
    prerequisites: ["Linear algebra fundamentals", "Basic quantum mechanics principles"]
  },
  {
    id: "evt-03",
    title: "Autonomous Robotics Build V2",
    dateDay: "04",
    dateMonth: "NOV",
    dateYear: "2025",
    type: "WORKSHOP",
    status: "UPCOMING",
    img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&w=800&q=80",
    description: "A hands-on workshop where participants will assemble and program autonomous rovers using ROS (Robot Operating System) and basic computer vision for obstacle avoidance.",
    speaker: "Robotics Club Lead",
    speakerRole: "Core Robotics Team, ASIET",
    location: "Engineering Lab 3",
    time: "10:00 AM - 03:00 PM",
    seatsRemaining: 12,
    agenda: [
      { time: "10:00 AM", title: "Hardware Assembly & Microcontrollers", description: "Setting up motor drivers and sensor arrays." },
      { time: "11:30 AM", title: "ROS Navigation Stack Configuration", description: "Mapping and localization algorithms." },
      { time: "01:30 PM", title: "Obstacle Course Testing Challenge", description: "Testing rovers on a simulated terrain." }
    ],
    prerequisites: ["Basic Python or C++ programming", "Bring your own laptop (Ubuntu/Linux preferred)"]
  },
  {
    id: "evt-04",
    title: "Neural Network Research Seminar",
    dateDay: "22",
    dateMonth: "SEP",
    dateYear: "2025",
    type: "SEMINAR",
    status: "COMPLETED",
    img: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?auto=format&fit=crop&w=800&q=80",
    description: "Review of recent papers on parameter-efficient fine-tuning (PEFT) methods for neural networks, focusing on LoRA and QLoRA.",
    speaker: "Sarah Jenkins, PhD Candidate",
    speakerRole: "Machine Learning Researcher",
    location: "Virtual (Zoom)",
    time: "06:00 PM - 07:30 PM",
    agenda: [
      { time: "06:00 PM", title: "Paper Presentation: PEFT Foundations", description: "Overview of rank decomposition matrices." },
      { time: "06:50 PM", title: "Code Walkthrough & Benchmarks", description: "Comparing full fine-tuning vs LoRA efficiency." }
    ]
  },
  {
    id: "evt-05",
    title: "Advanced Electronics Architecture",
    dateDay: "14",
    dateMonth: "AUG",
    dateYear: "2025",
    type: "WORKSHOP",
    status: "COMPLETED",
    img: "https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=800&q=80",
    description: "An intensive session on PCB design and high-frequency circuit architecture using modern CAD tools.",
    speaker: "Prof. David Lin",
    speakerRole: "Department of Electronics Engineering",
    location: "Electronics Lab 1",
    time: "01:00 PM - 05:00 PM",
    agenda: [
      { time: "01:00 PM", title: "High-Frequency PCB Layout Theory", description: "Signal integrity and impedance matching." },
      { time: "03:00 PM", title: "KiCad Hands-On Routing Exercise", description: "Routing multi-layer boards." }
    ]
  },
  {
    id: "evt-06",
    title: "Astrophysics & Space Observation",
    dateDay: "02",
    dateMonth: "JUL",
    dateYear: "2025",
    type: "SEMINAR",
    status: "COMPLETED",
    img: "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80",
    description: "An evening seminar exploring deep-space imaging, radio astronomy, and processing optical data from orbital telescopes.",
    speaker: "Dr. Alistair Vance",
    speakerRole: "Observational Astronomer",
    location: "Campus Observatory & Room 101",
    time: "07:00 PM - 09:30 PM"
  }
];
