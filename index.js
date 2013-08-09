
if ( module ) {
  module.exports = exports = procedure;
  procedure.noop = noop;
}

// example:
// var proc = require( 'procedure' );
// var recognizeSketch = proc( recognizeStroke )
//   .addPre(
//     proc( [
//       resampleStroke,
//       rotateAccordingOnIndicativeAngle,
//       translateAccordingToCentroid,
//       scaleAccordingToBoundingBox,
//     ] )
//   )
//   .addPost( extractCorners )
//   .addPost( extractParametersForLine )
//   .addPost( extractParametersForCircle );

// var result = recognizeSketch( stroke );

function noop( x ) { return x; }

function procedure() {

  var stack =  Array.prototype.slice.call( arguments );
  var pre = [], post = [], dirty = true;
  var _compiled;

  if ( stack.length === 1 && Array.isArray( stack[0] ) ) {
    stack = stack[ 0 ];
  }

  function run() {
    dirty && compile();
    return _compiled.apply( this, arguments );
  }

  function compile() {
    Array.isArray( pre ) || ( pre = [] );
    Array.isArray( stack ) || ( stack = [] );
    Array.isArray( post ) || ( post = [] );

    _compiled = pre
      .concat( stack )
      .concat( post )
      .reduce( function( sofar, f ) {
        return function( x ) {
          return f( sofar(x) );
        };
      }, noop );
    dirty = false;
    return run;
  };

  run.compile = compile;

  Object.defineProperty( run, 'dirty', {
    get: function() { return dirty; },
    set: function( s ) { dirty = s; }
  } );

  Object.defineProperty( run, 'stack', {
    get: function() { return stack; },
    set: function( s ) { stack = s; }
  } );

  Object.defineProperty( run, 'pre', {
    get: function() { return pre; },
    set: function( s ) { pre = s; }
  } );

  Object.defineProperty( run, 'post', {
    get: function() { return post; },
    set: function( s ) { post = s; }
  } );

  run.use = function( fn ) {
    if ( typeof fn === 'function' ) {
      stack.push( fn );
      dirty = true;
    }
    return run;
  };

  run.addPre = function( fn ) {
    if ( typeof fn === 'function' ) {
      pre.push( fn );
      dirty = true;
    }
    return run;
  };

  run.addPost = function( fn ) {
    if ( typeof fn === 'function' ) {
      post.push( fn );
      dirty = true;
    }
    return run;
  };

  return run;
};
