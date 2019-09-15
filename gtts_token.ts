import * as utf8 from 'utf8';
import * as request from 'request-promise-native';


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
  token_key = null;

  constructor( ){

  }

  async calculate_token( text, seed=null ){

    console.log( 'seed: ' + seed )
    if ( seed == null ){
      seed = await this._get_token_key();
      console.log( 'got seed from token_key: ' + seed );
    }

    var first_seed:number = null;
    var second_seed:number = null;
    [first_seed, second_seed] = seed.split(".")

    var d = utf8.encode( text ).split()

    var a:number = first_seed | 0

    d.map( v => { a += v; a = _work_token(a, this.SALT_1); } )

    a = _work_token(a, this.SALT_2)

    a ^= second_seed

    if ( a <= 0 ){
      a = ( a & 0x8fff ) + 0x8ffe
    }

    a %= 1e6

    console.log( 'a:' + a + ' first_seed:' + first_seed + ' a^first_seed:' + (a ^ first_seed) )
    return String(a) + "." + String(a ^ first_seed)
  }

  async _get_token_key(){
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
tkn.calculate_token( "hello world hello hello hello" ).then( tkn => {
  console.log( "Token: '" + tkn + "'" )
} );

