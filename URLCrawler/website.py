import urllib.request as urlib1
import urllib.request as urlib2
from urllib.error import URLError, HTTPError
import urllib.parse
from urlextract import URLExtract
import time
import sys
import os.path
import configparser
import json 
from datetime import datetime

from bs4 import BeautifulSoup
from config import Config




class Website:

    link = ""
    maindomain = ""
    rawhtml = ""
    config = None
    ctextinformation = ""
    ctextinformationjson = ""
    callHref = None
    textinformation = ""
    textinformationjson = ""
    allHref = None

    jsonarray = ""
    cjsonarray = ""
    newtext = ""

    allLinks=[]

    prconfig = None
    
    def __init__(self, link, prconfig, username, password):
        self.prconfig = prconfig       
        self.allLinks = [] # very important here. Without it, Python does not null the array and takes all the links from the searches before it. From the last Website object

        [noerror, self.rawhtml, statusCode]  = self.downlod(link, username, password)
        if noerror :
        
            [self.link, self.maindomain] = self.extractLink(link)
            #print(self.link)
            #print(self.maindomain)

            config = self.findConfig(self.link)
            self.config = config
            config = False
            
            [self.textinformationjson,textinformation, self.allHref, self.jsonarray] = self.extracrtDataFromHtmlBasic()
            self.textinformation = self.cleanTxt(textinformation)

            if config:            
                [self.ctextinformationjson,ctextinformation, self.callHref. self.cjsonarray] = self.extracrtDataFromHtml()
                self.ctextinformation = self.cleanTxt(ctextinformation)
                self.newtext = self.jsonToText(self.cjsonarray)
#                if prconfig.saveWebsite:
                    #self.saveTxT(self.ctextinformation, self.link)
#                    self.saveToJsonFile(self.ctextinformationjson, self.link)
#                    self.saveTxT2(self.newtext, self.link)
                
            else:
                self.newtext = self.jsonToText(self.jsonarray)
#                if prconfig.saveWebsite:
                    #self.saveTxT(self.textinformation, self.link)
#                    self.saveToJsonFile(self.textinformationjson, self.link)
#                    self.saveTxT2(self.newtext, self.link)
        else:
            self.newtext = ""

        return


    def downlod(self, link, username, password):
        try:
            dataall=""
            hdr = {'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.11 (KHTML, like Gecko) Chrome/23.0.1271.64 Safari/537.11',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            'Accept-Charset': 'ISO-8859-1,utf-8;q=0.7,*;q=0.3',
            'Accept-Encoding': 'none',
            'Accept-Language': 'en-US,en;q=0.8',
            'Connection': 'keep-alive'}
            passman = urlib2.HTTPPasswordMgrWithDefaultRealm()
            passman.add_password(None, link, username, password)
            authhandler = urlib2.HTTPBasicAuthHandler(passman)
            opener = urlib2.build_opener(authhandler)
            opener.addheaders = [('User-agent', 'Mozilla/5.0')]
            urlib2.install_opener(opener)
            # urlib2.Request.header_items = hdr
            res = urlib2.urlopen(link)
            dataall = res.read()
            res.close()
            return [True, dataall, 200]

                    
        except HTTPError as e:
            print("HTTPError")
            print(e.status)
            print(link)
            if e.status == 401:
                self.downlod(link, username, password)
            return[False, e, e.status]
        except URLError as e:
            print("URLError")
            print(link)
            print(e)
            return[False, e, 404]
        except UnicodeDecodeError as e:
            print("UnicodeDecodeError")
            print(link)
            print(e)
            return[False, e, 404]
        except Exception as e:
            print("Exception")
            print(link)
            print(e)
            return[False, e, 404]


    def extractLink(self, link):
        maindomain=""
        substrcount = link[8:].find("/")
        if substrcount != -1:
            mend = substrcount+8
            maindomain =link[:mend]
        else:
            maindomain = link

        if "https://" in link:
            if link.index("https://") == 0:
                link = link[8:]
        if "?" in link:
            link = link[:link.index("?")]
        return [link,maindomain]

    def findConfig(self, link):
        link = link.replace("/", "_")
        link = link.replace(".", "__")

        findconf =  os.path.isfile("./configWebsite/"+link)
       
        if findconf:
            config = configparser.ConfigParser()
            config.read("./configWebsite/"+link)
            divs = config.sections()
        
            return config

        return False

    def extracrtDataFromHtml(self):
        out=""
        divs = self.config.sections()

        soup = BeautifulSoup(self.rawhtml, 'html.parser')
        jsonarray=[]
        jsonarray.append({"timestamp": time.time()})
        allHrefFronSite=[]
        for d in divs:
            if self.config[d]['read'] == "yes":
                mydivs = soup.find_all(class_=self.config[d]['divname'])
                for x in mydivs:
                    allHref =  x.find_all('a')
                    allHrefJson=[]
                    for hr in allHref:
                        try:
                            hrjson={"link": hr['href'], "class": hr['class'], "text:": hr.getText()}
                        except:
                            hrjson={"link": hr['href'], "class": "None", "text:": hr.getText()}
                        allHrefJson.append(hrjson)
                    jasondiv = {"div": x.get('class'), "text": x.getText(), "href": allHrefJson}
                    jsonarray.append(jasondiv)
                    out = out + x.getText()
                    allHrefFronSite.append(allHrefJson)
        
        return [json.dumps(jsonarray), out, allHrefFronSite, jsonarray]

    def extracrtDataFromHtmlBasic(self):
        out=""
        soup = BeautifulSoup(self.rawhtml, 'html.parser')
        div = soup.find_all("div")
        jsonarray=[]
        jsonarray.append({"timestamp": time.time()})
        allHrefFronSite=[]
        for x in div:
            allHref =  x.find_all('a')
            allHrefJson=[]
            for hr in allHref:
                try:
                    hrjson={"link": hr['href'], "class": hr['class'], "text:": hr.getText()}
                except:
                    try:
                        hrjson={"link": hr['href'], "class": "None", "text:": hr.getText()}
                    except:
                        hrjson={"link":"None", "class": "None", "text:": hr.getText()}
                        
                allHrefJson.append(hrjson)

            jasondiv = {"div": x.get('class'), "text": x.getText(), "href": allHrefJson}
            jsonarray.append(jasondiv)
            out = out + x.getText()
            allHrefFronSite.append(allHrefJson)
        return [json.dumps(jsonarray), out, allHrefFronSite, jsonarray] 
        return ""

    def jsonToText(self, jsondata):
        retText=""
        methainfos = "[url] "+self.link+"\n"
        for x in jsondata:
            if 'text' in x.keys():
                if x['text'].strip() != "":
                    retText = retText+x['text']
                    for h in x['href']:
                        refinedLink = self.refinedLink(h['link'])
                        if refinedLink:
                            if refinedLink not in self.allLinks and "mailto" not in refinedLink and "@" not in refinedLink:
                                self.allLinks.append(refinedLink)
                            retText = retText+"[LINK] "+refinedLink+ "\n"
#                    if self.prconfig.saveequalsign:
#                        retText = retText+"\n==================\n"
            else:
                if 'timestamp' in x.keys():
                   # if self.prconfig.timestampInDate :
                    #    methainfos = methainfos+ " [timestamp] "+str(datetime.fromtimestamp(x['timestamp']))+"\n"
                   # else:
                     methainfos = methainfos+ " [timestamp] "+str(x['timestamp'])+"\n"                    
        retText = methainfos +"\n\n"+ retText
        return retText
    
    def refinedLink(self, link):
#        if self.prconfig.showmailaddress == False:
#            if "mailto" in link:
#                return False
        if "#navigation" in link:
            link = link.replace("#navigation", "")
        if "mailto" not in link and "@" not in link:
            if "http" not in link and "https" not in link:
                link = self.maindomain+link

        return link

    def saveToJsonFile(self, data, filename):
        filename = filename.replace("/", "_")
        filename = filename.replace(".", "__")
        datei = open("./out/"+filename,'w')
        datei.write(data)

    def saveTxT(self, data, filename):
        filename = filename.replace("/", "_")
        filename = filename.replace(".", "__")
        datei = open("./out/"+filename+"_onlytext.txt",'w')
        datei.write(data)
    def saveTxT2(self, data, filename):
        filename = filename.replace("/", "_")
        filename = filename.replace(".", "__")
        datei = open("./out/"+filename+"_onlytext_2.txt",'w')
        datei.write(data)

    def cleanTxt(self, data):
        retText = ""
        splittext = data.split("\n")

        notdoppelnewline1 = True
        notdoppelnewline2 = True
        for x in splittext:
            if x == "":
                if notdoppelnewline1:
                    notdoppelnewline1 = False
                else:
                    notdoppelnewline2 = False
            else:
                notdoppelnewline1 = True
                notdoppelnewline2 = True

            if notdoppelnewline1 or notdoppelnewline2:
                retText = retText+x.strip()+"\n"
            else:
                notdoppelnewline1 = True
                notdoppelnewline2 = True

        return retText
