with open('src/app/info/execom/page.tsx', 'r') as f:
    lines = f.readlines()

new_lines = []
skip = False
for i, line in enumerate(lines):
    # 1. Remove overflow-hidden from the main wrapper to fix sticky
    if i == 244 and 'className="bg-white text-navy font-inter min-h-screen selection:bg-red selection:text-white relative overflow-hidden"' in line:
        # Instead of global bg-white, let's make it bg-navy text-white globally, but we will override Roster and Archives.
        new_lines.append(line.replace('className="bg-white text-navy font-inter min-h-screen selection:bg-red selection:text-white relative overflow-hidden"', 'className="bg-navy text-white font-inter min-h-screen selection:bg-red selection:text-white relative overflow-x-hidden"'))
        continue

    # 1b. Fix Astrolabe in Hero
    if i == 258 and 'text-navy/10' in line:
        new_lines.append(line.replace('text-navy/10', 'text-white/10'))
        continue
    if i == 259 and 'text-navy' in line:
        new_lines.append(line.replace('text-navy', 'text-white'))
        continue
    if i == 284 and 'text-navy' in line:
        new_lines.append(line.replace('text-navy', 'text-white'))
        continue
    if i == 287 and 'text-transparent stroke-navy' in line:
        new_lines.append(line.replace('text-transparent stroke-navy', 'text-transparent stroke-white'))
        continue
    if i == 288 and 'rgba(10, 25, 47, 0.2)' in line:
        new_lines.append(line.replace('rgba(10, 25, 47, 0.2)', 'rgba(255,255,255,0.2)'))
        continue

    # Roster section needs bg-white and text-navy because we made the global bg-navy
    if i == 295 and '<section className="pb-32 relative z-10">' in line:
        new_lines.append('      <section className="bg-white text-navy pt-16 pb-32 relative z-10">\n')
        continue
    
    # In Roster, the fallback text (if empty) needs to be text-navy/40
    # Search input and category filters are already white/navy styled from last script, which is correct for a white section!

    # 6. Archives Section
    # Make Archives bg-navy (dark) to mix and match
    if i == 497 and 'py-32 bg-gray-50 relative z-10' in line:
        new_lines.append(line.replace('bg-gray-50', 'bg-navy text-white'))
        continue
    if i == 509 and 'text-navy uppercase tracking-tight' in line:
        new_lines.append(line.replace('text-navy', 'text-white'))
        continue
    if i == 522 and 'bg-white border border-navy/10' in line:
        new_lines.append(line.replace('bg-white border border-navy/10', 'bg-white/5 border border-white/10'))
        continue
    if i == 527 and 'hover:bg-navy/5' in line:
        new_lines.append(line.replace('hover:bg-navy/5', 'hover:bg-white/5'))
        continue
    if i == 530 and 'text-navy tracking-widest' in line:
        new_lines.append(line.replace('text-navy', 'text-white'))
        continue
    if i == 531 and 'bg-navy/5 text-navy/60' in line:
        new_lines.append(line.replace('bg-navy/5 text-navy/60', 'bg-white/10 text-white/60'))
        continue
    if i == 535 and 'text-navy/40 transition-transform' in line:
        new_lines.append(line.replace('text-navy/40', 'text-white/40'))
        continue
    
    # 6b. Replace Accordion Body (lines 548 - 562)
    if i == 548 and 'border-t border-navy/5 mt-2' in line:
        new_lines.append(line.replace('border-navy/5', 'border-white/5'))
        continue
    
    if i == 549 and 'div className="grid grid-cols-2' in line:
        # Start skipping the old accordion grid body
        skip = True
        # Insert the new accordion body
        new_lines.append('''                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6 mb-8">
                          {members.filter(m => m.category === "Core").slice(0, 4).map((member, j) => (
                            <div key={j} className="flex flex-col items-center text-center group">
                              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-4 relative shadow-lg">
                                <Image src={member.img} alt={member.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                              </div>
                              <span className="font-oswald text-lg font-bold text-white uppercase block truncate w-full">
                                {member.name}
                              </span>
                              <span className="font-inter text-[10px] font-bold text-white/50 uppercase tracking-widest block truncate w-full mt-1">
                                {member.role}
                              </span>
                            </div>
                          ))}
                        </div>
                        <div className="flex justify-center">
                          <Link href={`/info/execom/${year.replace("-", "")}`} className="flex items-center gap-2 font-oswald text-sm font-bold uppercase tracking-widest text-red hover:text-white transition-colors">
                            VIEW FULL ROSTER <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
''')
        continue
    
    if skip and '</div>' in line and i == 561:
        # End skipping at the closing div of the grid
        skip = False
        continue
        
    if skip:
        continue

    new_lines.append(line)

with open('src/app/info/execom/page.tsx', 'w') as f:
    f.writelines(new_lines)

print("Done")
