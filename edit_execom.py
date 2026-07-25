import re

with open('src/app/info/execom/page.tsx', 'r') as f:
    content = f.read()

# 1. Backgrounds and global colors
content = content.replace(
    'className="bg-navy text-white font-inter min-h-screen selection:bg-red selection:text-white relative overflow-hidden"',
    'className="bg-white text-navy font-inter min-h-screen selection:bg-red selection:text-white relative overflow-hidden"'
)
content = content.replace('mix-blend-screen', 'mix-blend-multiply')

# 2. Hero Typography
content = content.replace('className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10 pointer-events-none hidden lg:block"', 'className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px] opacity-10 pointer-events-none hidden lg:block text-navy/10"')
content = content.replace('text-white stroke-current stroke-[0.5] fill-none astrolabe-spin', 'text-navy stroke-current stroke-[0.5] fill-none astrolabe-spin')
content = content.replace('font-bold text-white uppercase', 'font-bold text-navy uppercase')
content = content.replace('text-transparent stroke-white', 'text-transparent stroke-navy')
content = content.replace('style={{ WebkitTextStroke: "2px rgba(255,255,255,0.2)" }}', 'style={{ WebkitTextStroke: "2px rgba(10, 25, 47, 0.2)" }}')

# 3. Sticky Filter bar
content = content.replace('bg-navy/80 backdrop-blur-xl border-y border-white/10', 'bg-white/90 backdrop-blur-xl border-y border-navy/10')
content = content.replace('bg-white/5 text-white/50 border-white/10 hover:border-white/30 hover:text-white', 'bg-navy/5 text-navy/50 border-navy/10 hover:border-navy/30 hover:text-navy')
content = content.replace('text-white/40 absolute left-4', 'text-navy/40 absolute left-4')
content = content.replace('bg-white/5 text-white placeholder:text-white/40', 'bg-navy/5 text-navy placeholder:text-navy/40')
content = content.replace('border border-white/10 focus:outline-none', 'border border-navy/10 focus:outline-none')

# 4. Roster List
content = content.replace('text-white/40 font-oswald', 'text-navy/40 font-oswald')
content = content.replace('border-b border-white/10 py-8 lg:py-12', 'border-b border-navy/10 py-8 lg:py-12')
content = content.replace('text-white/70 group-hover:text-white', 'text-navy/70 group-hover:text-navy')
content = content.replace('text-white/70 group-hover:text-red', 'text-navy/70 group-hover:text-red')
content = content.replace('text-white/40 mt-1', 'text-navy/40 mt-1')

# 5. Filter Animation (Wrap mapped items in AnimatePresence)
roster_search = """              {filteredMembers.length === 0 ? (
                <div className="py-20 text-navy/40 font-oswald text-2xl uppercase font-bold tracking-tight">
                  No matches found.
                </div>
              ) : (
                filteredMembers.map((member, idx) => (
                  <motion.div 
                    key={member.id}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-10%" }}
                    variants={fadeUpVariant}
                    onMouseEnter={() => setHoveredMemberId(member.id)}
                    className="group border-b border-navy/10 py-8 lg:py-12 cursor-pointer relative"
                  >"""

roster_replace = """              <AnimatePresence mode="wait">
                <motion.div
                  key={`${activeCategory}-${searchQuery}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-0"
                >
                  {filteredMembers.length === 0 ? (
                    <div className="py-20 text-navy/40 font-oswald text-2xl uppercase font-bold tracking-tight">
                      No matches found.
                    </div>
                  ) : (
                    filteredMembers.map((member, idx) => (
                      <div 
                        key={member.id}
                        onMouseEnter={() => setHoveredMemberId(member.id)}
                        className="group border-b border-navy/10 py-8 lg:py-12 cursor-pointer relative"
                      >"""

content = content.replace(roster_search, roster_replace)
# Also replace the closing tags for the map block
content = content.replace("""                  </motion.div>
                ))
              )}""", """                  </div>
                    ))
                  )}
                </motion.div>
              </AnimatePresence>""")

# 6. Archives Section
content = content.replace('py-32 bg-navy relative z-10', 'py-32 bg-gray-50 relative z-10')
content = content.replace('text-white uppercase tracking-tight', 'text-navy uppercase tracking-tight')
content = content.replace('bg-white/5 border border-white/10', 'bg-white border border-navy/10')
content = content.replace('hover:bg-white/5 transition-colors', 'hover:bg-navy/5 transition-colors')
content = content.replace('text-white tracking-widest', 'text-navy tracking-widest')
content = content.replace('bg-white/10 text-white/60', 'bg-navy/5 text-navy/60')
content = content.replace('text-white/40 transition-transform', 'text-navy/40 transition-transform')
content = content.replace('border-t border-white/5 mt-2', 'border-t border-navy/5 mt-2')
# We need to rewrite the inner part of the archive accordion completely
archive_inner_search = """                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-6 pt-6">
                          {members.map((member, i) => (
                            <div key={i} className="group">
                              <span className="font-oswald text-lg font-bold text-white uppercase block group-hover:text-red transition-colors truncate">
                                {member.name}
                              </span>
                              <span className="font-inter text-[10px] font-bold text-white/40 uppercase tracking-widest block truncate mt-1">
                                {member.role}
                              </span>
                            </div>
                          ))}
                        </div>"""
archive_inner_replace = """                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 mb-8">
                          {members.filter(m => m.category === "Core").slice(0, 4).map((member, i) => (
                            <div key={i} className="flex flex-col items-center text-center group">
                              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 relative shadow-lg">
                                <Image src={member.img} alt={member.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                              </div>
                              <span className="font-oswald text-lg font-bold text-navy uppercase block truncate w-full">
                                {member.name}
                              </span>
                              <span className="font-inter text-[10px] font-bold text-navy/50 uppercase tracking-widest block truncate w-full mt-1">
                                {member.role}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-center">
                          <Link href={`/info/execom/${year}`} className="flex items-center gap-2 font-oswald text-sm font-bold uppercase tracking-widest text-red hover:text-navy transition-colors">
                            VIEW FULL ROSTER <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>"""
content = content.replace(archive_inner_search, archive_inner_replace)

# 7. Mock data updates for img
content = content.replace("""    year,
    category: "Core"
  }));""", """    year,
    category: "Core",
    img: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop"
  }));""")

content = content.replace("""{ name: "Nikhil Sridhar", role: "Chairperson", year: "2023-24", category: "Core" }""", """{ name: "Nikhil Sridhar", role: "Chairperson", year: "2023-24", category: "Core", img: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop" }""")
content = content.replace("""{ name: "Megha Nair", role: "Vice Chair", year: "2023-24", category: "Core" }""", """{ name: "Megha Nair", role: "Vice Chair", year: "2023-24", category: "Core", img: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=400&auto=format&fit=crop" }""")
content = content.replace("""{ name: "Vivek Menon", role: "Secretary", year: "2023-24", category: "Core" }""", """{ name: "Vivek Menon", role: "Secretary", year: "2023-24", category: "Core", img: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?q=80&w=400&auto=format&fit=crop" }""")
content = content.replace("""{ name: "Farah Khan", role: "Treasurer", year: "2023-24", category: "Core" }""", """{ name: "Farah Khan", role: "Treasurer", year: "2023-24", category: "Core", img: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=400&auto=format&fit=crop" }""")

# 8. Join CTA
content = content.replace('py-32 bg-navy border-t border-white/10 relative z-10 overflow-hidden', 'py-32 bg-white border-t border-navy/10 relative z-10 overflow-hidden')
# The H2 is matched by 'text-white uppercase leading-none' (since we changed the other one to text-navy uppercase tracking-tight)
content = content.replace('font-bold text-white uppercase leading-none', 'font-bold text-navy uppercase leading-none')
content = content.replace('text-white/60 mb-12 max-w-xl', 'text-navy/60 mb-12 max-w-xl')

with open('src/app/info/execom/page.tsx', 'w') as f:
    f.write(content)

print("Done")
