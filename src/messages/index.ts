const MESSAGES = {
  // 400
  BAD_REQUEST: '잘못된 요청입니다',
  // 401
  UNAUTHORIZED: '인증이 필요합니다',
  TOKEN_CHECK: '토큰 값을 다시 확인해주세요',
  // 403
  FORBIDDEN: '접근 거부되었습니다',
  LIMIT_EXECEEDED: '잠시 후 다시 시도해주세요',
  // 404
  NOT_FOUND: '찾을 수 없는 리소스입니다',
  USER_NOT_FOUND: '존재하지 않는 사용자입니다',
  REPO_NOT_FOIND: '존재하지 않는 저장소입니다',
  // 413
  ENTITY_TOO_LARGE: '첨부 가능한 용량을 초과하였습니다',
  // 422
  ALREADY_EXIST_REPO: '이미 존재하는 저장소입니다',
  // 500
  UNKNOWN_ERROR: '알 수 없는 오류가 발생하였습니다',
  // 503
  UNAVAILABLE: '서비스 불가 상태입니다',
};

export const messageFrom = (statusCode: number) => {
  switch (statusCode) {
    case 400:
      return MESSAGES.BAD_REQUEST;
    case 401:
      return MESSAGES.UNAUTHORIZED;
    case 403:
      return MESSAGES.FORBIDDEN;
    case 404:
      return MESSAGES.NOT_FOUND;
    case 413:
      return MESSAGES.ENTITY_TOO_LARGE;
    case 503:
      return MESSAGES.UNAVAILABLE;
    case 500:
    default:
      return MESSAGES.UNKNOWN_ERROR;
  }
};

export default MESSAGES;
