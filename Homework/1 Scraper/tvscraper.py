#!/usr/bin/env python
# Name:
# Student number:
"""
This script scrapes IMDB and outputs a CSV file with highest rated tv series.
"""

import csv
from requests import get
from requests.exceptions import RequestException
from contextlib import closing
from bs4 import BeautifulSoup
import re

TARGET_URL = "http://www.imdb.com/search/title?num%5Fvotes=5000,&sort=user%5Frating,desc&title%5Ftype=tv%5Fseries"
BACKUP_HTML = 'tvseries.html'
OUTPUT_CSV = 'tvseries.csv'


def extract_tvseries(dom):
    """
    Extract a list of highest rated TV series from DOM (of IMDB page).
    Each TV series entry should contain the following fields:
    - TV Title
    - Rating
    - Genres (comma separated if more than one)
    - Actors/actresses (comma separated if more than one)
    - Runtime (only a number!)
    """
    
    # initiate output list
    tvseries = []

    # loop through content in html file
    for content in dom.find_all('div', class_="lister-item-content"):

        # initiate list for single serie
        serieinfo = []
        
        # add serie title to list
        serieinfo.append(content.h3.a.text)

        # add rating of serie to list
        for rating in content.find_all(class_ = "inline-block ratings-imdb-rating"):
            serieinfo.append(rating.get_text(strip=True))

        # add genre of serie to list
        for genre in content.find_all(class_ = "genre"):
            serieinfo.append(genre.get_text(strip=True))

        # create string to list all actors/actresses of serie
        actstr = ""
        
        # add actor/actress to actor-string
        for actors in content.find_all(class_ = "", href=re.compile("name")):
            actstr += actors.text + ", "

        # delete last comma from actor-string
        actstr = re.sub('\, $', '', actstr)
        
        # add actor-string to list
        serieinfo.append(actstr)

        # check if the runtime of serie is known
        runningtime = content.find_all(class_ = "runtime")
        if not runningtime:
            serieinfo.append("runtime unknown")
        # if runtime is known, add the number of minutes of serie to list
        else:
            for runtime in runningtime:
                runtimestr = runtime.text
                runtimestr = re.sub('\ min$', '', runtimestr)
                serieinfo.append(runtimestr)

        # nest list of single serie in list of tv-series
        tvseries.append(serieinfo)

    # return list of tv-series
    return tvseries


def save_csv(outfile, tvseries):
    """
    Output a CSV file containing highest rated TV-series.
    """
    writer = csv.writer(outfile)
    writer.writerow(['Title', 'Rating', 'Genre', 'Actors', 'Runtime'])

    i = 0
    for serie in range(0,len(tvseries)):
        writer.writerow([tvseries[i][0], tvseries[i][1], tvseries[i][2], tvseries[i][3], tvseries[i][4]])
        i += 1

def simple_get(url):
    """
    Attempts to get the content at `url` by making an HTTP GET request.
    If the content-type of response is some kind of HTML/XML, return the
    text content, otherwise return None
    """
    try:
        with closing(get(url, stream=True)) as resp:
            if is_good_response(resp):
                return resp.content
            else:
                return None
    except RequestException as e:
        print('The following error occurred during HTTP GET request to {0} : {1}'.format(url, str(e)))
        return None


def is_good_response(resp):
    """
    Returns true if the response seems to be HTML, false otherwise
    """
    content_type = resp.headers['Content-Type'].lower()
    return (resp.status_code == 200
            and content_type is not None
            and content_type.find('html') > -1)


if __name__ == "__main__":

    # get HTML content at target URL
    html = simple_get(TARGET_URL)

    # save a copy to disk in the current directory, this serves as an backup
    # of the original HTML, will be used in grading.
    with open(BACKUP_HTML, 'wb') as f:
        f.write(html)

    # parse the HTML file into a DOM representation
    dom = BeautifulSoup(html, 'html.parser')

    # extract the tv series (using the function you implemented)
    tvseries = extract_tvseries(dom)

    # write the CSV file to disk (including a header)
    with open(OUTPUT_CSV, 'w', newline='') as output_file:
        save_csv(output_file, tvseries)
