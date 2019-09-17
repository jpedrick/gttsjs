import * as gtts_token from './gtts_token';
import * as utf8 from 'utf8';
import * as request from 'request';
import * as fs from 'fs';

const GOOGLE_TTS_MAX_CHARS = 100;
const GOOGLE_TTS_URL = "https://translate.google.com/translate_tts";
const GOOGLE_TTS_HEADERS = {
      "Referer": "http://translate.google.com/",
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/47.0.2526.106 Safari/537.36",
      "Content-Type" : 'Application/json'
  };

class GTTS{
  lang:string = 'en-in';
  speed:number = 1.0;
  token : gtts_token.Token|null = null;

  constructor( 
    lang:string='en-in', 
    speed:number = 1.0
  ){
    this.speed = speed;
    this.token = new gtts_token.Token();
    this.lang = lang;
  }

  async uri( text:string ) : Promise<string|null> {
    if( this.token ){
      const tk = await this.token.calculate_token( text, null );

      if ( tk ){
        const payload = {
          ie : 'UTF-8',
          q : text,
          textlen : text.length,
          tl : this.lang,
          ttsspeed : Math.max( Math.min( this.speed, 1.0 ), 0.0 ),
          total : 1,
          idx : 0,
          client : 'tw-ob',
          tk : tk
        }

        // @ts-ignore
        const params : Array<string> = Object.keys(payload).map( k => k + '=' + String(payload[k]) ).join('&');
        const fulluri = [GOOGLE_TTS_URL, params].join('?');

        return fulluri;
      }
    }

    return null;
  }

  async fetch_and_save( text:string, save_to:string ){
    var uri:string|null = await this.uri( text );
    if( uri ){
      request.get( uri ).pipe( fs.createWriteStream( save_to ) );
    }

    return null;
  }
}

export function test(){
  var gtts = new GTTS( 'en-in', 0.5 );
  gtts.fetch_and_save("Ummm, Hello World, hello hello hello",'hi.mp3' );
}
