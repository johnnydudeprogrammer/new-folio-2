// /**
//  * @author qiao / https://github.com/qiao
//  * @author mrdoob / http://mrdoob.com
//  * @author alteredq / http://alteredqualia.com/
//  * @author WestLangley / http://github.com/WestLangley
//  * @author erich666 / http://erichaines.com
//  */

// // This set of controls performs orbiting, dollying (zooming), and panning.
// // Unlike TrackballControls, it maintains the "up" direction object.up (+Y by default).
// //
// //    Orbit - left mouse / touch: one finger move
// //    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
// //    Pan - right mouse, or arrow keys / touch: three finter swipe

// THREE.OrbitControls = function ( object, domElement ) {

// 	this.object = object;

// 	this.domElement = ( domElement !== undefined ) ? domElement : document;

// 	// Set to false to disable this control
// 	this.enabled = true;

// 	// "target" sets the location of focus, where the object orbits around
// 	this.target = new THREE.Vector3();

// 	// How far you can dolly in and out ( PerspectiveCamera only )
// 	this.minDistance = 0;
// 	this.maxDistance = Infinity;

// 	// How far you can zoom in and out ( OrthographicCamera only )
// 	this.minZoom = 0;
// 	this.maxZoom = Infinity;

// 	// How far you can orbit vertically, upper and lower limits.
// 	// Range is 0 to Math.PI radians.
// 	this.minPolarAngle = 0; // radians
// 	this.maxPolarAngle = Math.PI; // radians

// 	// How far you can orbit horizontally, upper and lower limits.
// 	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
// 	this.minAzimuthAngle = - Infinity; // radians
// 	this.maxAzimuthAngle = Infinity; // radians

// 	// Set to true to enable damping (inertia)
// 	// If damping is enabled, you must call controls.update() in your animation loop
// 	this.enableDamping = false;
// 	this.dampingFactor = 0.25;

// 	// This option actually enables dollying in and out; left as "zoom" for backwards compatibility.
// 	// Set to false to disable zooming
// 	this.enableZoom = true;
// 	this.zoomSpeed = 1.0;

// 	// Set to false to disable rotating
// 	this.enableRotate = true;
// 	this.rotateSpeed = 1.0;

// 	// Set to false to disable panning
// 	this.enablePan = true;
// 	this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

// 	// Set to true to automatically rotate around the target
// 	// If auto-rotate is enabled, you must call controls.update() in your animation loop
// 	this.autoRotate = false;
// 	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

// 	// Set to false to disable use of the keys
// 	this.enableKeys = true;

// 	// The four arrow keys
// 	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

// 	// Mouse buttons
// 	this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };

// 	// for reset
// 	this.target0 = this.target.clone();
// 	this.position0 = this.object.position.clone();
// 	this.zoom0 = this.object.zoom;

// 	//
// 	// public methods
// 	//

// 	this.getPolarAngle = function () {

// 		return phi;

// 	};

// 	this.getAzimuthalAngle = function () {

// 		return theta;

// 	};

// 	this.reset = function () {

// 		scope.target.copy( scope.target0 );
// 		scope.object.position.copy( scope.position0 );
// 		scope.object.zoom = scope.zoom0;

// 		scope.object.updateProjectionMatrix();
// 		scope.dispatchEvent( changeEvent );

// 		scope.update();

// 		state = STATE.NONE;

// 	};

// 	// this method is exposed, but perhaps it would be better if we can make it private...
// 	this.update = function() {

// 		var offset = new THREE.Vector3();

// 		// so camera.up is the orbit axis
// 		var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
// 		var quatInverse = quat.clone().inverse();

// 		var lastPosition = new THREE.Vector3();
// 		var lastQuaternion = new THREE.Quaternion();

// 		return function () {

// 			var position = scope.object.position;

// 			offset.copy( position ).sub( scope.target );

// 			// rotate offset to "y-axis-is-up" space
// 			offset.applyQuaternion( quat );

// 			// angle from z-axis around y-axis
// 			spherical.setFromVector3( offset );

// 			if ( scope.autoRotate && state === STATE.NONE ) {

// 				rotateLeft( getAutoRotationAngle() );

// 			}

// 			spherical.theta += sphericalDelta.theta;
// 			spherical.phi += sphericalDelta.phi;

// 			// restrict theta to be between desired limits
// 			spherical.theta = Math.max( scope.minAzimuthAngle, Math.min( scope.maxAzimuthAngle, spherical.theta ) );

// 			// restrict phi to be between desired limits
// 			spherical.phi = Math.max( scope.minPolarAngle, Math.min( scope.maxPolarAngle, spherical.phi ) );

// 			spherical.makeSafe();


// 			spherical.radius *= scale;

// 			// restrict radius to be between desired limits
// 			spherical.radius = Math.max( scope.minDistance, Math.min( scope.maxDistance, spherical.radius ) );

// 			// move target to panned location
// 			scope.target.add( panOffset );

// 			offset.setFromSpherical( spherical );

// 			// rotate offset back to "camera-up-vector-is-up" space
// 			offset.applyQuaternion( quatInverse );

// 			position.copy( scope.target ).add( offset );

// 			scope.object.lookAt( scope.target );

// 			if ( scope.enableDamping === true ) {

// 				sphericalDelta.theta *= ( 1 - scope.dampingFactor );
// 				sphericalDelta.phi *= ( 1 - scope.dampingFactor );

// 			} else {

// 				sphericalDelta.set( 0, 0, 0 );

// 			}

// 			scale = 1;
// 			panOffset.set( 0, 0, 0 );

// 			// update condition is:
// 			// min(camera displacement, camera rotation in radians)^2 > EPS
// 			// using small-angle approximation cos(x/2) = 1 - x^2 / 8

// 			if ( zoomChanged ||
// 				lastPosition.distanceToSquared( scope.object.position ) > EPS ||
// 				8 * ( 1 - lastQuaternion.dot( scope.object.quaternion ) ) > EPS ) {

// 				scope.dispatchEvent( changeEvent );

// 				lastPosition.copy( scope.object.position );
// 				lastQuaternion.copy( scope.object.quaternion );
// 				zoomChanged = false;

// 				return true;

// 			}

// 			return false;

// 		};

// 	}();

// 	this.dispose = function() {

// 		scope.domElement.removeEventListener( 'contextmenu', onContextMenu, false );
// 		scope.domElement.removeEventListener( 'mousedown', onMouseDown, false );
// 		scope.domElement.removeEventListener( 'mousewheel', onMouseWheel, false );
// 		scope.domElement.removeEventListener( 'MozMousePixelScroll', onMouseWheel, false ); // firefox

// 		scope.domElement.removeEventListener( 'touchstart', onTouchStart, false );
// 		scope.domElement.removeEventListener( 'touchend', onTouchEnd, false );
// 		scope.domElement.removeEventListener( 'touchmove', onTouchMove, false );

// 		document.removeEventListener( 'mousemove', onMouseMove, false );
// 		document.removeEventListener( 'mouseup', onMouseUp, false );
// 		document.removeEventListener( 'mouseout', onMouseUp, false );

// 		window.removeEventListener( 'keydown', onKeyDown, false );

// 		//scope.dispatchEvent( { type: 'dispose' } ); // should this be added here?

// 	};

// 	//
// 	// internals
// 	//

// 	var scope = this;

// 	var changeEvent = { type: 'change' };
// 	var startEvent = { type: 'start' };
// 	var endEvent = { type: 'end' };

// 	var STATE = { NONE : - 1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };

// 	var state = STATE.NONE;

// 	var EPS = 0.000001;

// 	// current position in spherical coordinates
// 	var spherical = new THREE.Spherical();
// 	var sphericalDelta = new THREE.Spherical();

// 	var scale = 1;
// 	var panOffset = new THREE.Vector3();
// 	var zoomChanged = false;

// 	var rotateStart = new THREE.Vector2();
// 	var rotateEnd = new THREE.Vector2();
// 	var rotateDelta = new THREE.Vector2();

// 	var panStart = new THREE.Vector2();
// 	var panEnd = new THREE.Vector2();
// 	var panDelta = new THREE.Vector2();

// 	var dollyStart = new THREE.Vector2();
// 	var dollyEnd = new THREE.Vector2();
// 	var dollyDelta = new THREE.Vector2();

// 	function getAutoRotationAngle() {

// 		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

// 	}

// 	function getZoomScale() {

// 		return Math.pow( 0.95, scope.zoomSpeed );

// 	}

// 	function rotateLeft( angle ) {

// 		sphericalDelta.theta -= angle;

// 	}

// 	function rotateUp( angle ) {

// 		sphericalDelta.phi -= angle;

// 	}

// 	var panLeft = function() {

// 		var v = new THREE.Vector3();

// 		return function panLeft( distance, objectMatrix ) {

// 			v.setFromMatrixColumn( objectMatrix, 0 ); // get X column of objectMatrix
// 			v.multiplyScalar( - distance );

// 			panOffset.add( v );

// 		};

// 	}();

// 	var panUp = function() {

// 		var v = new THREE.Vector3();

// 		return function panUp( distance, objectMatrix ) {

// 			v.setFromMatrixColumn( objectMatrix, 1 ); // get Y column of objectMatrix
// 			v.multiplyScalar( distance );

// 			panOffset.add( v );

// 		};

// 	}();

// 	// deltaX and deltaY are in pixels; right and down are positive
// 	var pan = function() {

// 		var offset = new THREE.Vector3();

// 		return function( deltaX, deltaY ) {

// 			var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

// 			if ( scope.object instanceof THREE.PerspectiveCamera ) {

// 				// perspective
// 				var position = scope.object.position;
// 				offset.copy( position ).sub( scope.target );
// 				var targetDistance = offset.length();

// 				// half of the fov is center to top of screen
// 				targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

// 				// we actually don't use screenWidth, since perspective camera is fixed to screen height
// 				panLeft( 2 * deltaX * targetDistance / element.clientHeight, scope.object.matrix );
// 				panUp( 2 * deltaY * targetDistance / element.clientHeight, scope.object.matrix );

// 			} else if ( scope.object instanceof THREE.OrthographicCamera ) {

// 				// orthographic
// 				panLeft( deltaX * ( scope.object.right - scope.object.left ) / scope.object.zoom / element.clientWidth, scope.object.matrix );
// 				panUp( deltaY * ( scope.object.top - scope.object.bottom ) / scope.object.zoom / element.clientHeight, scope.object.matrix );

// 			} else {

// 				// camera neither orthographic nor perspective
// 				console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );
// 				scope.enablePan = false;

// 			}

// 		};

// 	}();

// 	function dollyIn( dollyScale ) {

// 		if ( scope.object instanceof THREE.PerspectiveCamera ) {

// 			scale /= dollyScale;

// 		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

// 			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom * dollyScale ) );
// 			scope.object.updateProjectionMatrix();
// 			zoomChanged = true;

// 		} else {

// 			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
// 			scope.enableZoom = false;

// 		}

// 	}

// 	function dollyOut( dollyScale ) {

// 		if ( scope.object instanceof THREE.PerspectiveCamera ) {

// 			scale *= dollyScale;

// 		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

// 			scope.object.zoom = Math.max( scope.minZoom, Math.min( scope.maxZoom, scope.object.zoom / dollyScale ) );
// 			scope.object.updateProjectionMatrix();
// 			zoomChanged = true;

// 		} else {

// 			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );
// 			scope.enableZoom = false;

// 		}

// 	}

// 	//
// 	// event callbacks - update the object state
// 	//

// 	function handleMouseDownRotate( event ) {

// 		//console.log( 'handleMouseDownRotate' );

// 		rotateStart.set( event.clientX, event.clientY );

// 	}

// 	function handleMouseDownDolly( event ) {

// 		//console.log( 'handleMouseDownDolly' );

// 		dollyStart.set( event.clientX, event.clientY );

// 	}

// 	function handleMouseDownPan( event ) {

// 		//console.log( 'handleMouseDownPan' );

// 		panStart.set( event.clientX, event.clientY );

// 	}

// 	function handleMouseMoveRotate( event ) {

// 		//console.log( 'handleMouseMoveRotate' );

// 		rotateEnd.set( event.clientX, event.clientY );
// 		rotateDelta.subVectors( rotateEnd, rotateStart );

// 		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

// 		// rotating across whole screen goes 360 degrees around
// 		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

// 		// rotating up and down along whole screen attempts to go 360, but limited to 180
// 		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

// 		rotateStart.copy( rotateEnd );

// 		scope.update();

// 	}

// 	function handleMouseMoveDolly( event ) {

// 		//console.log( 'handleMouseMoveDolly' );

// 		dollyEnd.set( event.clientX, event.clientY );

// 		dollyDelta.subVectors( dollyEnd, dollyStart );

// 		if ( dollyDelta.y > 0 ) {

// 			dollyIn( getZoomScale() );

// 		} else if ( dollyDelta.y < 0 ) {

// 			dollyOut( getZoomScale() );

// 		}

// 		dollyStart.copy( dollyEnd );

// 		scope.update();

// 	}

// 	function handleMouseMovePan( event ) {

// 		//console.log( 'handleMouseMovePan' );

// 		panEnd.set( event.clientX, event.clientY );

// 		panDelta.subVectors( panEnd, panStart );

// 		pan( panDelta.x, panDelta.y );

// 		panStart.copy( panEnd );

// 		scope.update();

// 	}

// 	function handleMouseUp( event ) {

// 		//console.log( 'handleMouseUp' );

// 	}

// 	function handleMouseWheel( event ) {

// 		//console.log( 'handleMouseWheel' );

// 		var delta = 0;

// 		if ( event.wheelDelta !== undefined ) {

// 			// WebKit / Opera / Explorer 9

// 			delta = event.wheelDelta;

// 		} else if ( event.detail !== undefined ) {

// 			// Firefox

// 			delta = - event.detail;

// 		}

// 		if ( delta > 0 ) {

// 			dollyOut( getZoomScale() );

// 		} else if ( delta < 0 ) {

// 			dollyIn( getZoomScale() );

// 		}

// 		scope.update();

// 	}

// 	function handleKeyDown( event ) {

// 		//console.log( 'handleKeyDown' );

// 		switch ( event.keyCode ) {

// 			case scope.keys.UP:
// 				pan( 0, scope.keyPanSpeed );
// 				scope.update();
// 				break;

// 			case scope.keys.BOTTOM:
// 				pan( 0, - scope.keyPanSpeed );
// 				scope.update();
// 				break;

// 			case scope.keys.LEFT:
// 				pan( scope.keyPanSpeed, 0 );
// 				scope.update();
// 				break;

// 			case scope.keys.RIGHT:
// 				pan( - scope.keyPanSpeed, 0 );
// 				scope.update();
// 				break;

// 		}

// 	}

// 	function handleTouchStartRotate( event ) {

// 		//console.log( 'handleTouchStartRotate' );

// 		rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

// 	}

// 	function handleTouchStartDolly( event ) {

// 		//console.log( 'handleTouchStartDolly' );

// 		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
// 		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

// 		var distance = Math.sqrt( dx * dx + dy * dy );

// 		dollyStart.set( 0, distance );

// 	}

// 	function handleTouchStartPan( event ) {

// 		//console.log( 'handleTouchStartPan' );

// 		panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

// 	}

// 	function handleTouchMoveRotate( event ) {

// 		//console.log( 'handleTouchMoveRotate' );

// 		rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
// 		rotateDelta.subVectors( rotateEnd, rotateStart );

// 		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

// 		// rotating across whole screen goes 360 degrees around
// 		rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

// 		// rotating up and down along whole screen attempts to go 360, but limited to 180
// 		rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

// 		rotateStart.copy( rotateEnd );

// 		scope.update();

// 	}

// 	function handleTouchMoveDolly( event ) {

// 		//console.log( 'handleTouchMoveDolly' );

// 		var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
// 		var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;

// 		var distance = Math.sqrt( dx * dx + dy * dy );

// 		dollyEnd.set( 0, distance );

// 		dollyDelta.subVectors( dollyEnd, dollyStart );

// 		if ( dollyDelta.y > 0 ) {

// 			dollyOut( getZoomScale() );

// 		} else if ( dollyDelta.y < 0 ) {

// 			dollyIn( getZoomScale() );

// 		}

// 		dollyStart.copy( dollyEnd );

// 		scope.update();

// 	}

// 	function handleTouchMovePan( event ) {

// 		//console.log( 'handleTouchMovePan' );

// 		panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );

// 		panDelta.subVectors( panEnd, panStart );

// 		pan( panDelta.x, panDelta.y );

// 		panStart.copy( panEnd );

// 		scope.update();

// 	}

// 	function handleTouchEnd( event ) {

// 		//console.log( 'handleTouchEnd' );

// 	}

// 	//
// 	// event handlers - FSM: listen for events and reset state
// 	//

// 	function onMouseDown( event ) {

// 		if ( scope.enabled === false ) return;

// 		event.preventDefault();

// 		if ( event.button === scope.mouseButtons.ORBIT ) {

// 			if ( scope.enableRotate === false ) return;

// 			handleMouseDownRotate( event );

// 			state = STATE.ROTATE;

// 		} else if ( event.button === scope.mouseButtons.ZOOM ) {

// 			if ( scope.enableZoom === false ) return;

// 			handleMouseDownDolly( event );

// 			state = STATE.DOLLY;

// 		} else if ( event.button === scope.mouseButtons.PAN ) {

// 			if ( scope.enablePan === false ) return;

// 			handleMouseDownPan( event );

// 			state = STATE.PAN;

// 		}

// 		if ( state !== STATE.NONE ) {

// 			document.addEventListener( 'mousemove', onMouseMove, false );
// 			document.addEventListener( 'mouseup', onMouseUp, false );
// 			document.addEventListener( 'mouseout', onMouseUp, false );

// 			scope.dispatchEvent( startEvent );

// 		}

// 	}

// 	function onMouseMove( event ) {

// 		if ( scope.enabled === false ) return;

// 		event.preventDefault();

// 		if ( state === STATE.ROTATE ) {

// 			if ( scope.enableRotate === false ) return;

// 			handleMouseMoveRotate( event );

// 		} else if ( state === STATE.DOLLY ) {

// 			if ( scope.enableZoom === false ) return;

// 			handleMouseMoveDolly( event );

// 		} else if ( state === STATE.PAN ) {

// 			if ( scope.enablePan === false ) return;

// 			handleMouseMovePan( event );

// 		}

// 	}

// 	function onMouseUp( event ) {

// 		if ( scope.enabled === false ) return;

// 		handleMouseUp( event );

// 		document.removeEventListener( 'mousemove', onMouseMove, false );
// 		document.removeEventListener( 'mouseup', onMouseUp, false );
// 		document.removeEventListener( 'mouseout', onMouseUp, false );

// 		scope.dispatchEvent( endEvent );

// 		state = STATE.NONE;

// 	}

// 	function onMouseWheel( event ) {

// 		if ( scope.enabled === false || scope.enableZoom === false || ( state !== STATE.NONE && state !== STATE.ROTATE ) ) return;

// 		event.preventDefault();
// 		event.stopPropagation();

// 		handleMouseWheel( event );

// 		scope.dispatchEvent( startEvent ); // not sure why these are here...
// 		scope.dispatchEvent( endEvent );

// 	}

// 	function onKeyDown( event ) {

// 		if ( scope.enabled === false || scope.enableKeys === false || scope.enablePan === false ) return;

// 		handleKeyDown( event );

// 	}

// 	function onTouchStart( event ) {

// 		if ( scope.enabled === false ) return;

// 		switch ( event.touches.length ) {

// 			case 1:	// one-fingered touch: rotate

// 				if ( scope.enableRotate === false ) return;

// 				handleTouchStartRotate( event );

// 				state = STATE.TOUCH_ROTATE;

// 				break;

// 			case 2:	// two-fingered touch: dolly

// 				if ( scope.enableZoom === false ) return;

// 				handleTouchStartDolly( event );

// 				state = STATE.TOUCH_DOLLY;

// 				break;

// 			case 3: // three-fingered touch: pan

// 				if ( scope.enablePan === false ) return;

// 				handleTouchStartPan( event );

// 				state = STATE.TOUCH_PAN;

// 				break;

// 			default:

// 				state = STATE.NONE;

// 		}

// 		if ( state !== STATE.NONE ) {

// 			scope.dispatchEvent( startEvent );

// 		}

// 	}

// 	function onTouchMove( event ) {

// 		if ( scope.enabled === false ) return;

// 		event.preventDefault();
// 		event.stopPropagation();

// 		switch ( event.touches.length ) {

// 			case 1: // one-fingered touch: rotate

// 				if ( scope.enableRotate === false ) return;
// 				if ( state !== STATE.TOUCH_ROTATE ) return; // is this needed?...

// 				handleTouchMoveRotate( event );

// 				break;

// 			case 2: // two-fingered touch: dolly

// 				if ( scope.enableZoom === false ) return;
// 				if ( state !== STATE.TOUCH_DOLLY ) return; // is this needed?...

// 				handleTouchMoveDolly( event );

// 				break;

// 			case 3: // three-fingered touch: pan

// 				if ( scope.enablePan === false ) return;
// 				if ( state !== STATE.TOUCH_PAN ) return; // is this needed?...

// 				handleTouchMovePan( event );

// 				break;

// 			default:

// 				state = STATE.NONE;

// 		}

// 	}

// 	function onTouchEnd( event ) {

// 		if ( scope.enabled === false ) return;

// 		handleTouchEnd( event );

// 		scope.dispatchEvent( endEvent );

// 		state = STATE.NONE;

// 	}

// 	function onContextMenu( event ) {

// 		event.preventDefault();

// 	}

// 	//

// 	scope.domElement.addEventListener( 'contextmenu', onContextMenu, false );

// 	scope.domElement.addEventListener( 'mousedown', onMouseDown, false );
// 	scope.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
// 	scope.domElement.addEventListener( 'MozMousePixelScroll', onMouseWheel, false ); // firefox

// 	scope.domElement.addEventListener( 'touchstart', onTouchStart, false );
// 	scope.domElement.addEventListener( 'touchend', onTouchEnd, false );
// 	scope.domElement.addEventListener( 'touchmove', onTouchMove, false );

// 	window.addEventListener( 'keydown', onKeyDown, false );

// 	// force an update at start

// 	this.update();

// };

// THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
// THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

// Object.defineProperties( THREE.OrbitControls.prototype, {

// 	center: {

// 		get: function () {

// 			console.warn( 'THREE.OrbitControls: .center has been renamed to .target' );
// 			return this.target;

// 		}

// 	},

// 	// backward compatibility

// 	noZoom: {

// 		get: function () {

// 			console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
// 			return ! this.enableZoom;

// 		},

// 		set: function ( value ) {

// 			console.warn( 'THREE.OrbitControls: .noZoom has been deprecated. Use .enableZoom instead.' );
// 			this.enableZoom = ! value;

// 		}

// 	},

// 	noRotate: {

// 		get: function () {

// 			console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
// 			return ! this.enableRotate;

// 		},

// 		set: function ( value ) {

// 			console.warn( 'THREE.OrbitControls: .noRotate has been deprecated. Use .enableRotate instead.' );
// 			this.enableRotate = ! value;

// 		}

// 	},

// 	noPan: {

// 		get: function () {

// 			console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
// 			return ! this.enablePan;

// 		},

// 		set: function ( value ) {

// 			console.warn( 'THREE.OrbitControls: .noPan has been deprecated. Use .enablePan instead.' );
// 			this.enablePan = ! value;

// 		}

// 	},

// 	noKeys: {

// 		get: function () {

// 			console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
// 			return ! this.enableKeys;

// 		},

// 		set: function ( value ) {

// 			console.warn( 'THREE.OrbitControls: .noKeys has been deprecated. Use .enableKeys instead.' );
// 			this.enableKeys = ! value;

// 		}

// 	},

// 	staticMoving : {

// 		get: function () {

// 			console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
// 			return ! this.constraint.enableDamping;

// 		},

// 		set: function ( value ) {

// 			console.warn( 'THREE.OrbitControls: .staticMoving has been deprecated. Use .enableDamping instead.' );
// 			this.constraint.enableDamping = ! value;

// 		}

// 	},

// 	dynamicDampingFactor : {

// 		get: function () {

// 			console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
// 			return this.constraint.dampingFactor;

// 		},

// 		set: function ( value ) {

// 			console.warn( 'THREE.OrbitControls: .dynamicDampingFactor has been renamed. Use .dampingFactor instead.' );
// 			this.constraint.dampingFactor = value;

// 		}

// 	}

// } );


/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 * @author mrflix / http://felixniklas.de
 * 
 * released under MIT License (MIT)
 */
/*global THREE, console */

// This set of controls performs orbiting, dollying (zooming), and panning. It maintains
// the "up" direction as +Y, unlike the TrackballControls. Touch on tablet and phones is
// supported.
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finter swipe
//
// This is a drop-in replacement for (most) TrackballControls used in examples.
// That is, include this js file and wherever you see:
//    	controls = new THREE.TrackballControls( camera );
//      controls.target.z = 150;
// Simple substitute "OrbitControls" and the control should work as-is.

THREE.OrbitControls = function ( object, domElement, localElement ) {

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;
	this.localElement = ( localElement !== undefined ) ? localElement : document;

	// API

	// Set to false to disable this control
	this.enabled = true;

	// "target" sets the location of focus, where the control orbits around
	// and where it pans with respect to.
	this.target = new THREE.Vector3();
	// center is old, deprecated; use "target" instead
	this.center = this.target;

	// This option actually enables dollying in and out; left as "zoom" for
	// backwards compatibility
	this.noZoom = false;
	this.zoomSpeed = 1.0;
	// Limits to how far you can dolly in and out
	this.minDistance = 0;
	this.maxDistance = Infinity;

	// Set to true to disable this control
	this.noRotate = false;
	this.rotateSpeed = 1.0;

	// Set to true to disable this control
	this.noPan = false;
	this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

	// Set to true to automatically rotate around the target
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	// Set to true to disable use of the keys
	this.noKeys = false;
	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	////////////
	// internals

	var scope = this;

	var EPS = 0.000001;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

	var phiDelta = 0;
	var thetaDelta = 0;
	var scale = 1;
	var pan = new THREE.Vector3();

	var lastPosition = new THREE.Vector3();

	var STATE = { NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };
	var state = STATE.NONE;

	// events

	var changeEvent = { type: 'change' };


	this.rotateLeft = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		thetaDelta -= angle;

	};

	this.rotateUp = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		phiDelta -= angle;

	};

	// pass in distance in world space to move left
	this.panLeft = function ( distance ) {

		var panOffset = new THREE.Vector3();
		var te = this.object.matrix.elements;
		// get X column of matrix
		panOffset.set( te[0], te[1], te[2] );
		panOffset.multiplyScalar(-distance);
		
		pan.add( panOffset );

	};

	// pass in distance in world space to move up
	this.panUp = function ( distance ) {

		var panOffset = new THREE.Vector3();
		var te = this.object.matrix.elements;
		// get Y column of matrix
		panOffset.set( te[4], te[5], te[6] );
		panOffset.multiplyScalar(distance);
		
		pan.add( panOffset );
	};
	
	// main entry point; pass in Vector2 of change desired in pixel space,
	// right and down are positive
	this.pan = function ( delta ) {

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		if ( scope.object.fov !== undefined ) {

			// perspective
			var position = scope.object.position;
			var offset = position.clone().sub( scope.target );
			var targetDistance = offset.length();

			// half of the fov is center to top of screen
			targetDistance *= Math.tan( (scope.object.fov/2) * Math.PI / 180.0 );
			// we actually don't use screenWidth, since perspective camera is fixed to screen height
			scope.panLeft( 2 * delta.x * targetDistance / element.clientHeight );
			scope.panUp( 2 * delta.y * targetDistance / element.clientHeight );

		} else if ( scope.object.top !== undefined ) {

			// orthographic
			scope.panLeft( delta.x * (scope.object.right - scope.object.left) / element.clientWidth );
			scope.panUp( delta.y * (scope.object.top - scope.object.bottom) / element.clientHeight );

		} else {

			// camera neither orthographic or perspective - warn user
			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );

		}

	};

	this.dollyIn = function ( dollyScale ) {

		if ( dollyScale === undefined ) {

			dollyScale = getZoomScale();

		}

		scale /= dollyScale;

	};

	this.dollyOut = function ( dollyScale ) {

		if ( dollyScale === undefined ) {

			dollyScale = getZoomScale();

		}

		scale *= dollyScale;

	};

	this.update = function () {

		var position = this.object.position;
		var offset = position.clone().sub( this.target );

		// angle from z-axis around y-axis

		var theta = Math.atan2( offset.x, offset.z );

		// angle from y-axis

		var phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

		if ( this.autoRotate ) {

			this.rotateLeft( getAutoRotationAngle() );

		}

		theta += thetaDelta;
		phi += phiDelta;

		// restrict phi to be between desired limits
		phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

		// restrict phi to be betwee EPS and PI-EPS
		phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

		var radius = offset.length() * scale;

		// restrict radius to be between desired limits
		radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );
		
		// move target to panned location
		this.target.add( pan );

		offset.x = radius * Math.sin( phi ) * Math.sin( theta );
		offset.y = radius * Math.cos( phi );
		offset.z = radius * Math.sin( phi ) * Math.cos( theta );

		position.copy( this.target ).add( offset );

		this.object.lookAt( this.target );

		thetaDelta = 0;
		phiDelta = 0;
		scale = 1;
		pan.set(0,0,0);

		if ( lastPosition.distanceTo( this.object.position ) > 0 ) {

			this.dispatchEvent( changeEvent );

			lastPosition.copy( this.object.position );

		}

	};


	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.zoomSpeed );

	}

	function onMouseDown( event ) {

		if ( scope.enabled === false ) { return; }
		event.preventDefault();

		if ( event.button === 0 ) {
			if ( scope.noRotate === true ) { return; }

			state = STATE.ROTATE;

			rotateStart.set( event.clientX, event.clientY );

		} else if ( event.button === 1 ) {
			if ( scope.noZoom === true ) { return; }

			state = STATE.DOLLY;

			dollyStart.set( event.clientX, event.clientY );

		} else if ( event.button === 2 ) {
			if ( scope.noPan === true ) { return; }

			state = STATE.PAN;

			panStart.set( event.clientX, event.clientY );

		}

		// Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
		scope.domElement.addEventListener( 'mousemove', onMouseMove, false );
		scope.domElement.addEventListener( 'mouseup', onMouseUp, false );

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		if ( state === STATE.ROTATE ) {

			if ( scope.noRotate === true ) return;

			rotateEnd.set( event.clientX, event.clientY );
			rotateDelta.subVectors( rotateEnd, rotateStart );

			// rotating across whole screen goes 360 degrees around
			scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );
			// rotating up and down along whole screen attempts to go 360, but limited to 180
			scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

			rotateStart.copy( rotateEnd );

		} else if ( state === STATE.DOLLY ) {

			if ( scope.noZoom === true ) return;

			dollyEnd.set( event.clientX, event.clientY );
			dollyDelta.subVectors( dollyEnd, dollyStart );

			if ( dollyDelta.y > 0 ) {

				scope.dollyIn();

			} else {

				scope.dollyOut();

			}

			dollyStart.copy( dollyEnd );

		} else if ( state === STATE.PAN ) {

			if ( scope.noPan === true ) return;

			panEnd.set( event.clientX, event.clientY );
			panDelta.subVectors( panEnd, panStart );
			
			scope.pan( panDelta );

			panStart.copy( panEnd );

		}

		// Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
		scope.update();

	}

	function onMouseUp( /* event */ ) {

		if ( scope.enabled === false ) return;

		// Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
		scope.domElement.removeEventListener( 'mousemove', onMouseMove, false );
		scope.domElement.removeEventListener( 'mouseup', onMouseUp, false );

		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false || scope.noZoom === true ) return;

		var delta = 0;

		if ( event.wheelDelta ) { // WebKit / Opera / Explorer 9

			delta = event.wheelDelta;

		} else if ( event.detail ) { // Firefox

			delta = - event.detail;

		}

		if ( delta > 0 ) {

			scope.dollyOut();

		} else {

			scope.dollyIn();

		}

	}

	function onKeyDown( event ) {

		if ( scope.enabled === false ) { return; }
		if ( scope.noKeys === true ) { return; }
		if ( scope.noPan === true ) { return; }

		// pan a pixel - I guess for precise positioning?
		// Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
		var needUpdate = false;
		
		switch ( event.keyCode ) {

			case scope.keys.UP:
				scope.pan( new THREE.Vector2( 0, scope.keyPanSpeed ) );
				needUpdate = true;
				break;
			case scope.keys.BOTTOM:
				scope.pan( new THREE.Vector2( 0, -scope.keyPanSpeed ) );
				needUpdate = true;
				break;
			case scope.keys.LEFT:
				scope.pan( new THREE.Vector2( scope.keyPanSpeed, 0 ) );
				needUpdate = true;
				break;
			case scope.keys.RIGHT:
				scope.pan( new THREE.Vector2( -scope.keyPanSpeed, 0 ) );
				needUpdate = true;
				break;
		}

		// Greggman fix: https://github.com/greggman/three.js/commit/fde9f9917d6d8381f06bf22cdff766029d1761be
		if ( needUpdate ) {

			scope.update();

		}

	}
	
	function touchstart( event ) {

		if ( scope.enabled === false ) { return; }

		switch ( event.touches.length ) {

			case 1:	// one-fingered touch: rotate
				if ( scope.noRotate === true ) { return; }

				state = STATE.TOUCH_ROTATE;

				rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			case 2:	// two-fingered touch: dolly
				if ( scope.noZoom === true ) { return; }

				state = STATE.TOUCH_DOLLY;

				var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				var distance = Math.sqrt( dx * dx + dy * dy );
				dollyStart.set( 0, distance );
				break;

			case 3: // three-fingered touch: pan
				if ( scope.noPan === true ) { return; }

				state = STATE.TOUCH_PAN;

				panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			default:
				state = STATE.NONE;

		}
	}

	function touchmove( event ) {

		if ( scope.enabled === false ) { return; }

		event.preventDefault();
		event.stopPropagation();

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		switch ( event.touches.length ) {

			case 1: // one-fingered touch: rotate
				if ( scope.noRotate === true ) { return; }
				if ( state !== STATE.TOUCH_ROTATE ) { return; }

				rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				rotateDelta.subVectors( rotateEnd, rotateStart );

				// rotating across whole screen goes 360 degrees around
				scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );
				// rotating up and down along whole screen attempts to go 360, but limited to 180
				scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

				rotateStart.copy( rotateEnd );
				break;

			case 2: // two-fingered touch: dolly
				if ( scope.noZoom === true ) { return; }
				if ( state !== STATE.TOUCH_DOLLY ) { return; }

				var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				var distance = Math.sqrt( dx * dx + dy * dy );

				dollyEnd.set( 0, distance );
				dollyDelta.subVectors( dollyEnd, dollyStart );

				if ( dollyDelta.y > 0 ) {

					scope.dollyOut();

				} else {

					scope.dollyIn();

				}

				dollyStart.copy( dollyEnd );
				break;

			case 3: // three-fingered touch: pan
				if ( scope.noPan === true ) { return; }
				if ( state !== STATE.TOUCH_PAN ) { return; }

				panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				panDelta.subVectors( panEnd, panStart );
				
				scope.pan( panDelta );

				panStart.copy( panEnd );
				break;

			default:
				state = STATE.NONE;

		}

	}

	function touchend( /* event */ ) {

		if ( scope.enabled === false ) { return; }

		state = STATE.NONE;
	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.localElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

	this.domElement.addEventListener( 'keydown', onKeyDown, false );

	this.localElement.addEventListener( 'touchstart', touchstart, false );
	this.domElement.addEventListener( 'touchend', touchend, false );
	this.domElement.addEventListener( 'touchmove', touchmove, false );

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );