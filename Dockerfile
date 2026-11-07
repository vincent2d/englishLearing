FROM nginx:1.27-alpine

# This is a static site. Keep the runtime image limited to files served by nginx;
# audio/image generation scripts are excluded by .dockerignore.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY index.html home.css vehicles.html styles.css app.js \
     food-lesson.html food-lesson.css food-lesson.js \
     fruits.html fruits.css fruits.js manifest.json sw.js \
     /usr/share/nginx/html/
COPY assets/ /usr/share/nginx/html/assets/
COPY food-assets/ /usr/share/nginx/html/food-assets/
COPY fruit-assets/ /usr/share/nginx/html/fruit-assets/
COPY lessons/body/ /usr/share/nginx/html/lessons/body/

# Files copied from a host filesystem can arrive with restrictive modes on Linux.
# Ensure the non-root nginx worker can traverse directories and read the assets.
RUN chmod -R a+rX /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null http://127.0.0.1/ || exit 1
