# sight-backend

쿠러그 사이트의 백엔드 레포지토리입니다.

[![Coverage Status](https://coveralls.io/repos/github/khu-khlug/sight-backend/badge.svg?branch=main)](https://coveralls.io/github/khu-khlug/sight-backend?branch=main)

## 사전 준비

- Node.js v20.17.0
  - `nvm`을 사용하면 더 편합니다.
- Docker
  - 개발 환경이 도커로 이루어져 있습니다.

## 설치

```sh
git clone https://github.com/khu-khlug/sight-backend.git
npm install -g yarn
yarn install
```

## 로컬 개발 시

```sh
yarn compose
```

## 테스트 실행

```sh
yarn test
```
