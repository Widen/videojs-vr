/**
 * @author richt / http://richt.me
 * @author WestLangley / http://github.com/WestLangley
 *
 * W3C Device Orientation control (http://w3c.github.io/deviceorientation/spec-source-orientation.html)
 */
import window from 'global/window';
import * as THREE from 'three';

const DeviceOrientationControls = function(object) {
  const scope = this;

  this.object = object;
  this.object.rotation.reorder('YXZ');

  this.enabled = true;

  this.deviceOrientation = {};
  this.screenOrientation = 0;

  this.alphaOffset = 0;

  const onDeviceOrientationChangeEvent = function(event) {
    scope.deviceOrientation = event;
  };

  const onScreenOrientationChangeEvent = function() {
    scope.screenOrientation = window.orientation || 0;
  };

  // The angles alpha, beta and gamma form a set of intrinsic Tait-Bryan angles of type Z-X'-Y''

  const setObjectQuaternion = (function() {
    const zee = new THREE.Vector3(0, 0, 1);

    const euler = new THREE.Euler();

    const q0 = new THREE.Quaternion();

    const q1 = new THREE.Quaternion(-Math.sqrt(0.5), 0, 0, Math.sqrt(0.5));

    return function(quaternion, alpha, beta, gamma, orient) {
      euler.set(beta, alpha, -gamma, 'YXZ');

      quaternion.setFromEuler(euler);

      quaternion.multiply(q1);

      quaternion.multiply(q0.setFromAxisAngle(zee, -orient));
    };
  })();

  this.connect = function() {
    onScreenOrientationChangeEvent();

    window.addEventListener(
      'orientationchange',
      onScreenOrientationChangeEvent,
      false
    );
    window.addEventListener(
      'deviceorientation',
      onDeviceOrientationChangeEvent,
      false
    );

    scope.enabled = true;
  };

  this.disconnect = function() {
    window.removeEventListener(
      'orientationchange',
      onScreenOrientationChangeEvent,
      false
    );
    window.removeEventListener(
      'deviceorientation',
      onDeviceOrientationChangeEvent,
      false
    );

    scope.enabled = false;
  };

  this.update = function() {
    if (scope.enabled === false) {
      return;
    }

    const device = scope.deviceOrientation;

    if (device) {
      const alpha = device.alpha ?
        THREE.Math.degToRad(device.alpha) + scope.alphaOffset :
        0;

      const beta = device.beta ? THREE.Math.degToRad(device.beta) : 0;

      const gamma = device.gamma ? THREE.Math.degToRad(device.gamma) : 0;

      const orient = scope.screenOrientation ?
        THREE.Math.degToRad(scope.screenOrientation) :
        0;

      setObjectQuaternion(scope.object.quaternion, alpha, beta, gamma, orient);
    }
  };

  this.dispose = function() {
    scope.disconnect();
  };

  this.connect();
};

export default DeviceOrientationControls;
