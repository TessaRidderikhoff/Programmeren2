# Tessa Ridderikhoff
# 10759697
# 28-04-2018
# 
# convertCSV2JSON.py
#
# This function converts a csv file to a json file (list).
###############################################################################

import csv
import json

# open csv file
csvfile = open('MaleYearsOfSchooling.csv', 'r')

# determine fieldnames of data
fieldnames = ("HDI Rank", "Country", "y1990", "y1995", "y2000", "y2005", "y2010", "y2011", "y2012", "y2013", "y2014", "y2015")

# read csv file and count number of rows
reader = csv.DictReader(csvfile, fieldnames, delimiter=";")
numberofrows = sum(1 for row in reader)

# open and read csv file again 
csvfile = open('MaleYearsOfSchooling.csv', 'r')
reader = csv.DictReader(csvfile, fieldnames, delimiter=";")

# open json file to write in
jsonfile = open('MaleYearsOfSchooling.json', 'w')

# write begin of json list
jsonfile.write('[')

# for loop through reader file by row
counter = 0
for row in reader:
	counter += 1
	
	# write row to json file
	json.dump(row, jsonfile)
	
	# seperate rows by comma's in json file
	if not counter == numberofrows:
		jsonfile.write(',\n')
	
	# end file by closing list
	else:
		jsonfile.write(']')
