# AGENTS.md

## 프로젝트 개요
이 파일을 읽는 에이전트에게: 아래 정보를 기반으로 코드베이스를 이해하고 작업하라.
프로젝트 시작 시 이 파일을 먼저 읽고, 모르는 부분은 Explore로 탐색한 뒤 작업을 시작하라.

[프로젝트 한 줄 설명을 여기에 작성]

## 기술 스택
- **Language**: TypeScript / Java
- **Frontend Framework**: [Next.js / React / Vue 등]
- **Backend Framework**: [Spring Boot / NestJS 등]
- **Package Manager**: [npm / yarn / pnpm / gradle / maven]
- **Database**: [PostgreSQL / MySQL / MongoDB 등]
- **Test**: [Jest / JUnit / Vitest 등]
- **CI/CD**: [GitHub Actions / Jenkins 등]

## 디렉토리 구조
[프로젝트 구조를 여기에 작성 — /init 실행 시 자동 생성됨]

## 자주 쓰는 명령어
[아래 명령어를 프로젝트에 맞게 수정]
- 개발 서버 실행: `npm run dev`
- 테스트 실행: `npm run test`
- 빌드: `npm run build`
- Spring 실행: `./gradlew bootRun`
- Spring 테스트: `./gradlew test`

## 코딩 컨벤션
- 네이밍: camelCase (TS 변수·함수), PascalCase (클래스·컴포넌트), UPPER_SNAKE_CASE (상수)
- 주석: 한글 기본, 기술 용어 영문 혼용, why만 설명 (what은 코드가 말한다)
- 커밋: Conventional Commits (feat/fix/refactor/test/docs/chore)
- 함수 최대 40줄, 파일 최대 600줄 — 초과 시 반드시 분리
- 테스트 네이밍: test_[대상]_[조건]_[기대결과]

## 에이전트 위임 힌트
- 새 기능 설계: @Prometheus 먼저 호출
- 버그 근본 원인 불명: @Oracle 호출
- 라이브러리·패턴 조회: @Librarian 호출
- 복잡한 멀티파일 작업: @Hephaestus 호출 (목표만 전달)
- 빠른 파일 탐색: @Explore 호출
- 병렬 실행 필요: 프롬프트에 ulw 포함

## 절대 금지 (명시적 승인 없이)
- node_modules, target, dist 폴더 직접 수정
- .env, .env.* 파일 읽기·수정
- 기존 테스트 삭제·비활성화·skip 처리
- git push --force 실행
- 퍼블릭 API 시그니처 변경 (하위 호환성 파괴)
- 요청 범위를 벗어난 파일 수정

## Skills 경로
- 글로벌 skills: ~/.config/opencode/skills/
- 프로젝트 skills: .opencode/skills/
- git 작업: /git-master 호출
- 브라우저 자동화: /playwright 호출
