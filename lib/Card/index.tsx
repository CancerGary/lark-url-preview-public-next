import classnames from "classnames";
import { useTranslation } from "react-i18next";
import { MouseEventHandler } from "react";

export type LinkProps = {
  href?: string;
  iconHref: string;
  text?: string;
  onClick?: () => void;
  isDark?: boolean;
  iconSvg?: JSX.Element;
};

let defaultLinkSvg = (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    data-icon="GlobalLinkOutlined"
  >
    <path
      d="M18.849 2.699a5.037 5.037 0 0 0-7.1.97L8.97 7.372a4.784 4.784 0 0 0 .957 6.699l.972.729a1 1 0 0 0 1.2-1.6l-.972-.73a2.784 2.784 0 0 1-.557-3.898l2.777-3.703a3.037 3.037 0 1 1 4.8 3.72l-1.429 1.786a1 1 0 1 0 1.562 1.25l1.43-1.788a5.037 5.037 0 0 0-.862-7.138Z"
      fill="currentColor"
    ></path>
    <path
      d="M5.152 21.301a5.037 5.037 0 0 0 7.1-.97l2.777-3.703a4.784 4.784 0 0 0-.957-6.699L13.1 9.2a1 1 0 0 0-1.2 1.6l.973.73a2.784 2.784 0 0 1 .556 3.898l-2.777 3.703a3.037 3.037 0 1 1-4.8-3.72l1.429-1.786a1 1 0 0 0-1.562-1.25l-1.43 1.787a5.037 5.037 0 0 0 .863 7.14Z"
      fill="currentColor"
    ></path>
  </svg>
);
export let newDefaultLinkSvg = (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M16.397 10.853L18.231 8.58901C18.5004 8.26708 18.7031 7.89475 18.8271 7.49372C18.9512 7.0927 18.9943 6.67099 18.9538 6.25316C18.9133 5.83533 18.79 5.42974 18.5912 5.06001C18.3924 4.69028 18.122 4.36381 17.7958 4.09962C17.4696 3.83543 17.094 3.6388 16.6911 3.52118C16.2881 3.40356 15.8657 3.3673 15.4486 3.41452C15.0315 3.46175 14.6279 3.5915 14.2615 3.79623C13.895 4.00096 13.5729 4.27657 13.314 4.60701L10.327 8.29501C9.98389 8.71901 9.75623 9.22451 9.6661 9.76245C9.57597 10.3004 9.62643 10.8525 9.81258 11.3652C9.99874 11.8778 10.3143 12.3337 10.7285 12.6885C11.1428 13.0433 11.6418 13.2849 12.177 13.39L10.75 15.151C9.99442 14.8349 9.32286 14.3472 8.78856 13.7264C8.25426 13.1057 7.8719 12.369 7.67179 11.5748C7.47169 10.7806 7.45934 9.95071 7.63573 9.1509C7.81212 8.3511 8.17239 7.60337 8.68799 6.96701L11.675 3.27901C12.1083 2.73337 12.6454 2.27901 13.2553 1.94218C13.8652 1.60535 14.5358 1.39273 15.2283 1.3166C15.9209 1.24048 16.6217 1.30236 17.2902 1.49868C17.9587 1.69499 18.5817 2.02184 19.1231 2.46034C19.6646 2.89885 20.1137 3.4403 20.4447 4.05342C20.7756 4.66655 20.9818 5.33917 21.0512 6.03244C21.1207 6.7257 21.052 7.42586 20.8493 8.09244C20.6465 8.75903 20.3137 9.37882 19.87 9.91601L19.018 10.969C18.1718 10.6909 17.2654 10.6508 16.398 10.853H16.397Z"
      fill="currentColor"
    />
    <path
      d="M13.623 9.27001C13.234 8.95439 12.802 8.69579 12.34 8.50201L10.915 10.262C11.405 10.359 11.88 10.572 12.295 10.909C12.9161 11.4104 13.3239 12.1287 13.436 12.919C13.874 12.254 14.4679 11.7061 15.166 11.323C14.8296 10.5215 14.2994 9.81605 13.623 9.27001ZM11 20.273C11 20.45 11.013 20.623 11.037 20.794C10.0786 21.7379 8.79568 22.2798 7.45084 22.309C6.10599 22.3382 4.80082 21.8524 3.80234 20.951C2.80386 20.0496 2.18755 18.8007 2.07948 17.4599C1.97142 16.1191 2.37977 14.7877 3.221 13.738L6.077 10.21L6.168 11.076C6.232 11.686 6.441 12.244 6.756 12.722L4.86 15.066C4.34789 15.7196 4.11322 16.5483 4.20663 17.3734C4.30003 18.1984 4.71402 18.9537 5.35929 19.4763C6.00455 19.9988 6.82938 20.2468 7.65583 20.1667C8.48228 20.0866 9.24412 19.6848 9.777 19.048L11.002 17.536L11 17.638V20.273Z"
      fill="currentColor"
    />
    <g clip-path="url(#clip0_2_5)">
      <path
        d="M16.8391 13.0523C17.0408 12.5656 17.7296 12.566 17.9313 13.0523L18.3264 14.0075C18.8261 15.2139 19.7844 16.1726 20.9907 16.6727L21.9463 17.0692C22.4326 17.2708 22.4326 17.9597 21.9463 18.1614L20.9911 18.5569C20.3932 18.8046 19.8499 19.1676 19.3924 19.6253C18.9349 20.083 18.572 20.6264 18.3245 21.2244L17.9304 22.1764C17.7292 22.6636 17.0394 22.6631 16.8382 22.1764L16.4431 21.2198C16.1957 20.6213 15.8328 20.0774 15.375 19.6193C14.9172 19.1611 14.3735 18.7978 13.7751 18.55L12.8232 18.1559C12.3369 17.9547 12.3369 17.2658 12.8232 17.0641L13.7802 16.6672C14.9864 16.1674 15.9449 15.2091 16.4449 14.0029L16.8391 13.0523Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath id="clip0_2_5">
        <rect
          width="11"
          height="11"
          fill="currentColor"
          transform="translate(12 12)"
        />
      </clipPath>
    </defs>
  </svg>
);

export let addIconSvg = (
  <svg
    width="1em"
    height="1em"
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M18.5 2C19.6935 2 20.8381 2.47411 21.682 3.31802C22.5259 4.16193 23 5.30653 23 6.5C23 7.69347 22.5259 8.83807 21.682 9.68198C20.8381 10.5259 19.6935 11 18.5 11H17C16.7348 11 16.4804 10.8946 16.2929 10.7071C16.1054 10.5196 16 10.2652 16 10C16 9.73478 16.1054 9.48043 16.2929 9.29289C16.4804 9.10536 16.7348 9 17 9H18.5C19.163 9 19.7989 8.73661 20.2678 8.26777C20.7366 7.79893 21 7.16304 21 6.5C21 5.83696 20.7366 5.20107 20.2678 4.73223C19.7989 4.26339 19.163 4 18.5 4H5.5C4.83696 4 4.20107 4.26339 3.73223 4.73223C3.26339 5.20107 3 5.83696 3 6.5V7C3 7.552 3.224 8.052 3.586 8.414L3.581 8.419C3.67388 8.51809 3.74561 8.63507 3.7918 8.7628C3.83799 8.89052 3.85768 9.02632 3.84966 9.16191C3.84165 9.29749 3.80609 9.43002 3.74517 9.55141C3.68425 9.67281 3.59924 9.78052 3.49533 9.86797C3.39141 9.95543 3.27077 10.0208 3.14075 10.0601C3.01074 10.0994 2.87409 10.1118 2.73913 10.0966C2.60416 10.0813 2.47372 10.0387 2.35576 9.97141C2.23779 9.90409 2.13478 9.81344 2.053 9.705C1.3745 8.96773 0.998544 8.00197 1 7V6.5C1 5.30653 1.47411 4.16193 2.31802 3.31802C3.16193 2.47411 4.30653 2 5.5 2H18.5Z"
      fill="currentColor"
    />
    <path
      d="M12 9C12.2652 9 12.5196 9.10536 12.7071 9.29289C12.8946 9.48043 13 9.73478 13 10C13 10.2652 12.8946 10.5196 12.7071 10.7071C12.5196 10.8946 12.2652 11 12 11H9.41399L17.293 18.879C17.3885 18.9712 17.4647 19.0816 17.5171 19.2036C17.5695 19.3256 17.5971 19.4568 17.5982 19.5896C17.5994 19.7224 17.5741 19.8541 17.5238 19.977C17.4735 20.0998 17.3993 20.2115 17.3054 20.3054C17.2115 20.3993 17.0998 20.4735 16.9769 20.5238C16.8541 20.5741 16.7224 20.5994 16.5896 20.5983C16.4568 20.5971 16.3256 20.5695 16.2036 20.5171C16.0816 20.4647 15.9712 20.3885 15.879 20.293L7.99999 12.415V15C7.99999 15.2652 7.89464 15.5196 7.7071 15.7071C7.51956 15.8946 7.26521 16 6.99999 16C6.73478 16 6.48042 15.8946 6.29289 15.7071C6.10535 15.5196 5.99999 15.2652 5.99999 15V9.571C5.99999 9.41973 6.06002 9.27465 6.16688 9.16759C6.27375 9.06054 6.41873 9.00026 6.56999 9H12Z"
      fill="currentColor"
    />
  </svg>
);

export function Link({
  href,
  iconHref,
  text,
  onClick,
  isDark,
  iconSvg,
}: LinkProps) {
  return (
    <span className="larkw-user-editor__url-preview">
      <a
        className="larkw-user-editor__url-preview__anchor"
        rel="noopener noreferrer"
        target="_blank"
        href={href}
        onClick={(e) => {
          if (!href) e.preventDefault();
          onClick?.();
        }}
      >
        {iconHref ? (
          <svg
            className="larkw-user-editor__dye-image larkw-user-editor__url-preview__icon larkw-user-editor__url-preview__icon--dye-image"
            viewBox="0 0 14 14"
            width="14"
            height="14"
          >
            <filter id="daeec1c0-4684-4bf7-8fc1-a46c5f86e476">
              <feColorMatrix
                in="SourceGraphic"
                colorInterpolationFilters="sRGB"
                type="matrix"
                values={
                  isDark
                    ? "0.298 0 0 0 0 0 0.533 0 0 0 0 0 1 0 0 0 0 0 1 0"
                    : "0.078 0 0 0 0 0 0.337 0 0 0 0 0 0.941 0 0 0 0 0 1 0"
                }
              ></feColorMatrix>
            </filter>
            <image
              xlinkHref={iconHref}
              x="0"
              y="0"
              width="14"
              height="14"
              filter="url(#daeec1c0-4684-4bf7-8fc1-a46c5f86e476)"
            ></image>
          </svg>
        ) : (
          <span className="universe-icon larkw-user-editor__url-preview__icon larkw-user-editor__url-preview__icon--default">
            {iconSvg ? iconSvg : newDefaultLinkSvg}
          </span>
        )}
        <span>{text ? text : "\u200b"}</span>
      </a>
    </span>
  );
}

export function Card({
  onCopy,
  nickName,
  avatarUrl,
  links,
  debugInfo,
  isDark,
  requirePermission,
  showNotice,
  hasPermission,
  executePreview,
  loadingPreviewFromServer,
  hasPreviewFromServer,
  copyButtonText,
}: {
  onCopy?: MouseEventHandler;
  nickName?: string;
  avatarUrl?: string;
  links?: LinkProps[];
  debugInfo?: string;
  isDark?: boolean;
  requirePermission?: boolean;
  showNotice?: boolean;
  hasPermission?: boolean;
  executePreview?: () => void;
  loadingPreviewFromServer?: boolean;
  hasPreviewFromServer?: boolean;
  copyButtonText?: string;
}) {
  const { t } = useTranslation();
  let enablePreviewFromServer = Boolean(
    process.env.NODE_ENV === "development" ||
      localStorage.getItem("enablePreviewFromServer"),
  );
  return (
    <div
      className="larkw-userprofile__manager__profile-section"
      style={{
        boxShadow: "0 3px 12px 2px rgba( 31,35,41 ,0.12)",
        WebkitFontSmoothing: "antialiased",
      }}
    >
      <div
        className="larkw-userprofile__manager__profiles-container larkw-userprofile__manager__profiles-container--multi"
        // @ts-ignore
        style={{ "--profile-length": 1, "--profile-current-index": 0 }}
      >
        <div className="larkw-userprofile__manager__profile">
          <div className="larkw-userprofile__profile">
            <div
              className="larkw-userprofile__profile__wheel-section"
              style={{ marginTop: 0 }}
            >
              <div className="larkw-userprofile__profile__header">
                <div className="larkw-userprofile__profile__cover">
                  <img
                    src="https://s3-imfile.feishucdn.com/static-resource/image/19c0687a-194b-4040-8a2c-d932237f8758_MIDDLE?file_type=profile_top_img"
                    alt="DynamicImage"
                    className="larkw__dynamic-image larkw-userprofile__profile__cover-image"
                  />
                  <div className="larkw-userprofile__profile__cover-mask"></div>
                </div>
              </div>
              <div className="larkw-userprofile__profile__body">
                <div className="larkw-userprofile__profile__key-info">
                  <div className="larkw-userprofile__profile__avatar-container">
                    <div className="larkw-avatar__container">
                      <div className="larkw-userprofile__profile__avatar-wrapper">
                        <span
                          className="ud__avatar ud__avatar-filled ud__avatar-circle ud__avatar-image larkc-avatar larkw-avatar larkw-userprofile__profile__avatar"
                          style={{ width: 90, height: 90 }}
                        >
                          <img
                            className="ud__avatar__image"
                            src={
                              "https://lf3-static.bytednsdoc.com/obj/eden-cn/nuhbopldnuhf/default-lark-avatar.jpg"
                            }
                            alt=""
                          />
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="larkw-userprofile__profile__alias-or-username">
                    <span className="larkw-userprofile__profile__alias-or-username-text">
                      {nickName ?? t("飞书用户")}
                    </span>
                    <div className="larkw-userprofile__profile__tags--follow-username"></div>
                  </div>
                </div>
                <div className="larkw-userprofile__profile__content">
                  <div className="larkw-userprofile__profile__main">
                    <div className="larkw-userprofile__profile__many-info">
                      <div className="larkw-user-description larkw-userprofile__profile__user-description">
                        <div
                          className={classnames(
                            "larkw-user-editor__previewer larkw-user-editor__previewer--clickable larkw-user-description__previewer--default",
                            {
                              ["larkw-user-editor__previewer--placeholder"]:
                                !Boolean(links?.length),
                            },
                          )}
                        >
                          <div className="larkw-user-editor__previewer__main">
                            <div
                              className="larkw-user-editor__previewer__content"
                              style={{ WebkitLineClamp: 5 }}
                            >
                              {links?.length
                                ? links?.map(
                                    ({ href, text, iconHref }, index) => (
                                      <Link
                                        key={`${index}-${text}-${href}-${iconHref}`}
                                        text={text}
                                        href={href}
                                        iconHref={iconHref}
                                        isDark={isDark}
                                      />
                                    ),
                                  )
                                : t("输入你的个性签名...")}
                            </div>
                          </div>
                          <div className="larkw-user-editor__previewer__fake-scroll-bar"></div>
                        </div>
                      </div>

                      <div className="larkw-userprofile__profile__cta-buttons">
                        <button
                          className="larkw-userprofile__profile__cta-button larkw-userprofile__profile__cta-button--left-and-right"
                          onClick={onCopy}
                        >
                          <div className="larkw-userprofile__profile__cta-button__icon">
                            <span className="universe-icon">
                              <svg
                                width="1em"
                                height="1em"
                                viewBox="0 0 24 24"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                              >
                                <path
                                  d="M9 3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v12a1 1 0 1 1-2 0V4h-9a1 1 0 0 1-1-1Z"
                                  fill="currentColor"
                                />
                                <path
                                  d="M5 6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8a2 2 0 0 0-2-2H5Z"
                                  fill="currentColor"
                                />
                              </svg>
                            </span>
                          </div>
                          <div className="larkw-userprofile__profile__cta-button__name">
                            {copyButtonText ? copyButtonText : t("复制签名")}
                          </div>
                        </button>
                      </div>
                      {process.env.NODE_ENV === "development" && debugInfo}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
