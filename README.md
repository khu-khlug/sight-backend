# sight-backend

쿠러그 사이트의 백엔드 레포지토리입니다.

[![Coverage Status](https://coveralls.io/repos/github/khu-khlug/sight-backend/badge.svg?branch=main)](https://coveralls.io/github/khu-khlug/sight-backend?branch=main)

## 사전 준비

- Node.js v16.20.2
  - `nvm`을 사용하면 더 편합니다.
- Docker
  - 개발 환경이 도커로 이루어져 있습니다.

> [!IMPORTANT]
> 현재 서버가 구동되고 있는 리눅스 환경의 버전이 상당히 오래되었습니다.
> 때문에, NodeJS v16까지만 지원을 하고 있으며, 이후 버전부터는 에러가 발생하며 켜지지 않는 문제가 있습니다.
> 따라서, NodeJS의 버전을 `^16`으로 고정하고, 해당 문제를 해결할 때까지 유지합니다.

> [!NOTE]
> Yarn은 NodeJS v18부터 정상적으로 지원되므로 이후 NodeJS 버전 문제를 해결한 뒤에 다시 yarn으로 전환할 예정입니다.

## 설치

```sh
git clone https://github.com/khu-khlug/sight-backend.git
npm install
```

## 로컬 개발 시

```sh
npm run compose
```

## 테스트 실행

```sh
npm run test
```
