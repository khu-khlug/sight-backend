FROM node:20-alpine as builder

ENV NODE_ENV build
WORKDIR /sight

COPY ./ /sight

RUN npm ci
RUN npm run build \
  && npm prune --production

FROM node:20-alpine

ENV NODE_ENV production
WORKDIR /sight

COPY --from=builder /sight/package*.json ./
COPY --from=builder /sight/.env.* ./
COPY --from=builder /sight/node_modules/ ./node_modules/
COPY --from=builder /sight/dist/ ./dist/

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
