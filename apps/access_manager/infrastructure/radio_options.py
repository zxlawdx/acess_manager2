"""Extract options observed in device HTML, without a guessed model catalogue."""
from html.parser import HTMLParser

NAMES={'channel':'channel','bandwidth':'bandwidth','ht20':'bandwidth_code','standard':'standard','mode':'standard','txpower':'tx_power','transmitpower':'tx_power','countrycode':'country','country':'country'}

class RadioSelectParser(HTMLParser):
    def __init__(self):
        super().__init__();self.options={};self.key=None;self.option=None
    def handle_starttag(self, tag, attrs):
        d=dict(attrs)
        if tag=='select':
            self.key=NAMES.get(str(d.get('name') or d.get('id') or '').lower())
        if tag=='option' and self.key and 'value' in d:
            self.option={'value':d['value'],'label':''}
    def handle_data(self, text):
        if self.option is not None:self.option['label']+=text
    def handle_endtag(self, tag):
        if tag=='option' and self.key and self.option is not None:
            self.option['label']=self.option['label'].strip() or self.option['value']
            self.options.setdefault(self.key,[]).append(self.option);self.option=None
        if tag=='select':self.key=None


def radio_options(html):
    parser=RadioSelectParser();parser.feed(html);return parser.options
