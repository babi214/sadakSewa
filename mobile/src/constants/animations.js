import { Easing } from 'react-native-reanimated'

export const ANIMATION_DURATION = {
  fast: 200,
  normal: 300,
  slow: 500,
  verySlow: 800,
}

export const EASING = {
  default: Easing.bezier(0.25, 0.1, 0.25, 1),
  enter: Easing.bezier(0.16, 1, 0.3, 1),
  exit: Easing.bezier(0.4, 0, 0.6, 1),
  spring: Easing.bezier(0.34, 1.56, 0.64, 1),
}

export const FADE_IN = {
  entering: { type: 'fade', duration: ANIMATION_DURATION.normal },
  exiting: { type: 'fade', duration: ANIMATION_DURATION.fast },
}

export const SLIDE_UP = {
  entering: { type: 'slide', direction: 'up', duration: ANIMATION_DURATION.normal },
  exiting: { type: 'slide', direction: 'down', duration: ANIMATION_DURATION.fast },
}

export const SLIDE_LEFT = {
  entering: { type: 'slide', direction: 'left', duration: ANIMATION_DURATION.normal },
  exiting: { type: 'slide', direction: 'right', duration: ANIMATION_DURATION.fast },
}

export const SCALE_IN = {
  entering: { type: 'scale', duration: ANIMATION_DURATION.normal },
}

export const STAGGER_DELAY = 80

export const SPRING_CONFIG = {
  damping: 15,
  mass: 0.5,
  stiffness: 100,
  overshootClamping: false,
  restSpeedThreshold: 0.01,
  restDisplacementThreshold: 0.01,
}
