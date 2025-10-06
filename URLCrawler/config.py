
import configparser





class Config:

    config=None

    showurl = False
    showurlinline = False

    recusive_url_search_on = False
    recusive_url_search_depth = 0
    recusive_url_maxurl = 100

    listOfWebsite="./config/listOfWebsite"

    configIgnore="./config/ignore"

    showmailaddress = False

    timestampInDate = False

    saveWebsite = False
    saveequalsign = False

    flaskuseconfig = False
    flaskhost = "127.0.0.1"
    flaksport = 5000
    
    def __init__(self):

        self.config = configparser.ConfigParser()
        self.config.read("./config/url.ini")
        print(self.config )

        if self.config['recusive_url_search']['on'] == "1":
            self.recusive_url_search_on = True
        self.recusive_url_search_depth = int(self.config['recusive_url_search']['depth'])
        self.recusive_url_maxurl = int(self.config['recusive_url_search']['maxurl'])

        if self.config['setup']['showurl'] == "1":
            self.showurl = True
        if self.config['setup']['showurlinline'] == "1":
            self.showurlinline = True

        if self.config['setup']['listOfWebsite'] != "":
            self.listOfWebsite = self.config['setup']['listOfWebsite']
        if self.config['setup']['configIgnore'] != "":
            self.configIgnore = self.config['setup']['configIgnore']
        
        if self.config['setup']['timestamp'] == "date":
            self.timestampInDate = True

        if self.config['setup']['saveWebsite'] == "1":
            self.saveWebsite = True

        if self.config['setup']['saveequalsign'] == "1":
            self.saveequalsign = True


        if self.config['refinedlink']['showmailaddress'] == "1":
            self.showmailaddress = True


        if self.config['flaskconfig']['useconfig'] == "1":
            self.flaskuseconfig = True
        if self.config['flaskconfig']['host'] != "":
            self.flaskhost = self.config['flaskconfig']['host']
        if self.config['flaskconfig']['port'] != "":
            self.flaksport = int(self.config['flaskconfig']['port'])
        