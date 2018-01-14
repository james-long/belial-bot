from lxml import html
import requests
from openpyxl import load_workbook
import os

# This script scrapes all unit info from cf-wiki.info into a unitData folder.
# This script isn't very maintainable and involves a lot of hard coding (ie. it works, but any update will probably break it).
# This was done in order to allocate more time to bot development, and web scraping will likely be done in Node for future updates.

os.makedirs("unitData");

page = requests.get("https://cf-wiki.info/units")
tree = html.fromstring(page.content)
wikiLink = tree.xpath('//*[@id="dokuwiki__content"]/div[2]/div/div/div/ul//div/a/@href')
wikiLinkNum = [i.split('/')[-1] for i in wikiLink]

for number in wikiLinkNum:
    tempPage = requests.get("https://cf-wiki.info/units/" + str(number) + "?do=edit")
    
    tempPageTree = html.fromstring(tempPage.content)
    tempPageRawText = tempPageTree.xpath('//*[@id="wiki__text"]/text()')
    text_file = open("unitData/" + str(number) + ".txt", "w", encoding='utf-8')
    for info in tempPageRawText[0].split("\r\n"):
        text_file.write(info.replace("\n", "") + "\n")
    text_file.close()



