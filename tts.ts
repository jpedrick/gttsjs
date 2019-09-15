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

function play( context, audioBuffer ){
  var source = context.createBufferSource();
  source.buffer = audioBuffer;
  source.connect( context.destination );

  source.start(0);
}

function playByteArray( bytes ){
  var context = new AudioContext();
  var buffer = new Uint8Array( bytes.length );
  buffer.set( new Uint8Array(bytes), 0 );

  context.decodeAudioData( buffer.buffer, audioBuffer => { play( context, audioBuffer ) } );
}

class GTTS{
  lang:string = 'en-in';
  speed:number = 1.0;
  token = null;

  constructor( 
    lang:string='en-in', 
    speed:number = 1.0
  ){
    this.speed = speed;
    this.token = new gtts_token.Token();
    this.lang = lang;
  }

  async fetch( text:string, save_to = null ){
    console.log( 'getting token for: ', text );
    const tk = await this.token.calculate_token( text );
    console.log( 'tk: ', tk );
    
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

    const params = Object.keys(payload).map( k => k + '=' + payload[k] ).join('&');
    const fulluri = [GOOGLE_TTS_URL, params].join('?');
    if ( save_to != null ){
      request.get( fulluri ).pipe( fs.createWriteStream( save_to ) );
    } 

    return null;
  }
}

export function test(){
  var gtts = new GTTS( 'en-in', 0.5 );
  gtts.fetch("Ummm, Hello World, hello hello hello",'hi.mp3' );
}
