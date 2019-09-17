import * as utf8 from 'utf8';
import * as request from 'request-promise-native';
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
  token : Token|null = null;

  constructor( 
    lang:string='en-in', 
    speed:number = 1.0
  ){
    this.speed = speed;
    this.token = new Token();
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

function _rshift( a:number, d:number ){
  return a >= 0 ? a >> d : (a + 0x100000000) >> d
}

function _work_token( a:number, seed:String ){
  var r = a;
  for ( var i = 0; i < seed.length - 2; i += 3 ){
    const c = seed[ i + 2 ]
    const d = c > 'a' ? +c - 87 : +c;
    const e = seed[i+1] == '+' ? _rshift(r, d) : r << d;
    r = seed[i] == '+' ? r + e & 4294967295 : r ^ d;
  }

  return r;
}

export class Token {

  SALT_1 = "+-a^+6";
  SALT_2 = "+-3^+b+-f";
  token_key:string|null = null;

  constructor( ){

  }

  async calculate_token( text:string, seed:string|null ) : Promise<string|null> {

    console.log( 'seed: ' + seed )
    if ( seed == null ){
      seed = await this._get_token_key();
      console.log( 'got seed from token_key: ' + seed );
    }

    if( seed ){
      const split_seed = seed.split(".")

      var first_seed:number = +split_seed[0];
      var second_seed:number = +split_seed[1];

      var d = Array.from( utf8.encode( text ) );

      var a:number = first_seed | 0

      d.map( v => { a += +v; a = _work_token(a, this.SALT_1); } )

      a = _work_token(a, this.SALT_2)

      a ^= second_seed

      if ( a <= 0 ){
        a = ( a & 0x8fff ) + 0x8ffe
      }

      a %= 1e6

      console.log( 'a:' + a + ' first_seed:' + first_seed + ' a^first_seed:' + (a ^ first_seed) )

      return String(a) + "." + String(a ^ first_seed)
    }

    return null;
  }

  async _get_token_key() : Promise<string|null> {
    if ( this.token_key != null ){
      return this.token_key;
    }
    const response = await request.get( { uri : 'https://translate.google.com/' } );
    const tkk_expr = response.match("(tkk:.*?),");

    const result = tkk_expr[1].match(/\d+\.\d+/)[0];

    this.token_key = result;

    return this.token_key;
  }

}

var tkn = new Token( );

const key = tkn._get_token_key().then( key => {
    console.log( "TokenKey: '" + key + "'" )
  }
)
tkn.calculate_token( "hello world hello hello hello", null ).then( function ( tkn:string|null ) {
  console.log( "Token: '" + tkn + "'" )
} );

export function test(){
  var gtts = new GTTS( 'en-in', 0.5 );
  gtts.fetch_and_save("Ummm, Hello World, hello hello hello",'hi.mp3' );
}
