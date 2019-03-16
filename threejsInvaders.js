
var renderer = null, 
scene = null, 
camera = null,
root = null,
group = null,
bunny = null,
directionalLight = null;
//orbitControls = null;
var object;
// ANIMATION VARIABLES
var robot_mixer = {};
var deadAnimator;
var morphs = [];
robot_idle = null,
robots_in_scene = 0;
var animator = null;
var raycaster;
loopAnimation = false;

num_name = 1;
crateAnimator = null;
animateRobot = true;

// MOUSE
var mouse = new THREE.Vector2(), INTERSECTED, CLICKED;

var duration = 1500; // ms
var currentTime = Date.now();
var actualTime = Date.now();
var startedTime = Date.now();

var deadTime;

var robots = [];

var clonar = 6;

var animation = "run";

var score = 0; 

function changeAnimation(animation_text)
{
    animation = animation_text;

    if(animation =="dead")
    {
        createDeadAnimation();
    }
    else
    {
        robot_idle.rotation.x = 0;
        robot_idle.position.y = 0;
    }
}

function createDeadAnimation()
{

}

function loadFBX()
{
    var loader = new THREE.FBXLoader();
    loader.load( 'models/Robot/robot_run.fbx', function ( object ) 
    {

        object.mixer = new THREE.AnimationMixer( scene );
        var action = object.mixer.clipAction(object.animations[0], object)
        object.scale.set(0.02, 0.02, 0.02);
        object.position.x = -100;
        object.position.y = 500;
        object.rotation.y = Math.PI/2;
        object.name=0;
        action.play();
        object.traverse( function ( child ) {
            if ( child.isMesh ) {
                child.castShadow = true;
                child.receiveShadow = true;
            }
        } );
        
        robot_idle = object;
        robots.push(robot_idle);
        scene.add( object );
    } );
}

function clone(){

    var newRobot = cloneFbx(robot_idle);
    newRobot.mixer = new THREE.AnimationMixer(scene);
    var action = newRobot.mixer.clipAction(robot_idle.animations[0], newRobot);
    action.play()
    newRobot.position.x = -100;
    newRobot.position.y = 0;
    newRobot.deadTime = null;
    newRobot.name = num_name;
    num_name ++;
    robots_in_scene ++;
    posz = Math.floor(Math.random() * 200) - 100;
    newRobot.position.z = posz;
    robots.push(newRobot)
    scene.add(newRobot);
    
}

function animate() {

    var now = Date.now();
    var deltat = now - currentTime;
    currentTime = now;

    seconds = (now - actualTime)/1000
    
    if (seconds >= 1.5 && robots_in_scene < clonar){
 
        clone(); 
        actualTime = now;
    }

    if (robots_in_scene > 0){

        for (robot_i of robots){

            if(robot_i.live != false && robot_i.deadTime == null)
            {
                robot_i.mixer.update(deltat * 0.001);
                robot_i.position.x += 0.2;
            }
            else {
                nowTime = Date.now();
                aux = (nowTime - robot_i.deadTime)/1000

                if (aux >= 2){

                    robot_i.deadTime = null;
                    robot_i.live = true;
                    robot_i.dead = true;
                    scene.remove(robot_i)
                    robots_in_scene--;
                    score ++;
                    document.getElementById("score").innerHTML = "score: " + score;

                }

            }      

            if (robot_i.position.x >= 100 && robot_i.dead != true){

                score --;
                if (score <= 0){score = 0}
                document.getElementById("score").innerHTML = "score: " + score;
                robot_i.position.x = -100;                
            }
        }
    }
}


function run()
{
    requestAnimationFrame(function() { run(); });
    
        // Render the scene
        renderer.render( scene, camera );

        // Update the animations
        KF.update();

        NowTime = Date.now();

        elapsedTime = (NowTime - startedTime)/1000

        document.getElementById("timer").innerHTML = 20 - elapsedTime

        if(document.getElementById("timer").innerHTML > 0){


            animate();

        }
        else {

            startedTime = Date.now();

            score = -1;
            now = Date.now();
            currentTime = Date.now();
            actualTime = Date.now();
        }
        // Update the camera controller
        //orbitControls.update();
}

function createScene(canvas) 
{
    
    // Create the Three.js renderer and attach it to our canvas
    renderer = new THREE.WebGLRenderer( { canvas: canvas, antialias: true } );

    // Set the viewport size
    renderer.setSize(window.innerWidth, window.innerHeight);

    // Create a new Three.js scene
    scene = new THREE.Scene();

    // Add  a camera so we can view the scene
    camera = new THREE.PerspectiveCamera( 45, canvas.width / canvas.height, 1, 4000 );
    camera.position.set(250,200,0);
    camera.lookAt(new THREE.Vector3(0,0,0))
    scene.add(camera);

    //orbitControls = new THREE.OrbitControls(camera, renderer.domElement);
    
    // Create a group to hold all the objects
    root = new THREE.Object3D;
    
    // Add a directional light to show off the object
    directionalLight = new THREE.DirectionalLight( 0xffffff, 1);

    // Create and add all the lights
    directionalLight.position.set(2, 2, 2);
    root.add(directionalLight);

    ambientLight = new THREE.AmbientLight ( 0x888888 );
    root.add(ambientLight);

    // Load FBX
    loadFBX()
    
    // Create a group to hold the objects
    group = new THREE.Object3D;
    root.add(group);

    // Create grass texture map
    var map = new THREE.TextureLoader().load("images/metal.jpg");
    map.wrapS = map.wrapT = THREE.RepeatWrapping;
    map.repeat.set(1,1);

    var color = 0xffffff;

    // Put in a ground plane to show off the lighting
    geometry = new THREE.PlaneGeometry(200, 200, 50, 50);
    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({color:color, map:map, side:THREE.DoubleSide}));
    mesh.rotation.x = -Math.PI / 2;

    // Add the mesh to our group
    scene.add( mesh );
    mesh.castShadow = false;
    mesh.receiveShadow = true;

    // Now add the group to our scene
    scene.add( root );

    // Raycast
    raycaster = new THREE.Raycaster();

    document.addEventListener('mousedown', onDocumentMouseDown);
    window.addEventListener( 'resize', onWindowResize);

    deadAnimations();

}

function onWindowResize() 
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
}

function onDocumentMouseDown(event)
{
    event.preventDefault();

    mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

    // find intersections
    raycaster.setFromCamera( mouse, camera );

    var intersects = raycaster.intersectObjects( robots, true );

    if ( intersects.length > 0 ) 
    {
        CLICKED = intersects[ 0 ].object;

        if(!animator.running)
        {
            for(var i = 0; i<= animator.interps.length -1; i++)
            {
                animator.interps[i].target = robots[CLICKED.parent.name].rotation;
                robots[CLICKED.parent.name].live = false;
                robots[CLICKED.parent.name].deadTime = Date.now();
                console.log(robots[CLICKED.parent.name])

            }
            
            playAnimations();
        }
        //robots_in_scene --;
    } 
    else 
    {
        if ( CLICKED ) 
            CLICKED.material.emissive.setHex( CLICKED.currentHex );

        CLICKED = null;
    }
}

function deadAnimations()
{
    animator = new KF.KeyFrameAnimator;
    animator.init({ 
        interps:
            [
                { 
                    keys:[0, .33, .66, 1], 
                    values:[
                            { x: 0, y : Math.PI/2, z : 0 },
                            { x: 0, y : Math.PI/2 * 3, z: Math.PI/6 },
                            { x: 0, y : Math.PI/2 * 5, z: Math.PI/6 * 2},
                            { x: 0, y : Math.PI/2 * 5, z: Math.PI/6 * 3 },
                            ],
                },
            ],
        loop: loopAnimation,
        duration:duration,
    });    

}

function playAnimations()
{
    animator.start();
}

