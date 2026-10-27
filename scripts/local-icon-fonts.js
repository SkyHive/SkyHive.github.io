'use strict';

// Butterfly's pseudo-element icons use hardcoded family names. Keep the pinned
// theme untouched while pointing those selectors at the renamed local subset.
hexo.extend.filter.register('after_render:css', css => css
  .replaceAll('Font Awesome 7 Free', 'SkyHive Icons')
  .replaceAll('Font Awesome 6 Free', 'SkyHive Icons')
  .replaceAll('Font Awesome 6 Brands', 'SkyHive Brands'));
