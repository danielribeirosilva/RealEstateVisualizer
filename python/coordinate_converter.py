import re

fname = 'list.txt'
with open(fname) as f:
    lines = f.readlines()

    for line in lines:
    	line_split = re.split('\xc2|\xb0|\'|\xa0|"|N|S|W|E|\n', line)
    	line_split = [x for x in line_split if x]

    	#N/S
    	lat = float(line_split[0]) + float(line_split[1])/60 + float(line_split[2])/3600
    	if 'S' in line:
    		lat = - lat
    	#W/E
    	lon = float(line_split[3]) + float(line_split[4])/60 + float(line_split[5])/3600
    	if 'W' in line:
    		lon = - lon

    	print str(lat) + "\t" + str(lon)
