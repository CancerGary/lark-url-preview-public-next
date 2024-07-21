import React, {
  Fragment,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { v4 as uuidv4 } from "uuid";

import { useInViewport, useRequest, useResetState } from "ahooks";
import ExpandIcon from "./icon_expand-sidebar_outlined.svg";
import {
  Button,
  Checkbox,
  LocaleProvider,
  DatePicker,
  Empty,
  Icon,
  Input,
  Modal,
  Radio,
  Skeleton,
  Space,
  Spin,
  Switch,
  TabPane,
  Tabs,
  TextArea,
  Toast,
  Tooltip,
  Typography,
} from "@douyinfe/semi-ui";
import { addIconSvg, Card, Link } from "@/lib/Card";
import { buildCustomPreviewUrl, buildImgKeyUrl } from "@/lib/utils";
import copy from "copy-to-clipboard";
import mobile from "is-mobile";
import { sendEvent } from "@/lib/tea";
import pinyin from "tiny-pinyin";
import { I18nextProvider, useTranslation } from "react-i18next";
import i18n from "@/lib/i18n";
import { processHandlebars } from "@/pages/api/_lib/hbs-engine/process-handlebars";
import dayjs from "dayjs";
import zhCN from "@douyinfe/semi-ui/lib/es/locale/source/zh_CN";
import enUS from "@douyinfe/semi-ui/lib/es/locale/source/en_US";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import utc from "dayjs/plugin/utc";
import localizedFormat from "dayjs/plugin/localizedFormat";
import advancedFormat from "dayjs/plugin/advancedFormat";
import weekOfYear from "dayjs/plugin/weekOfYear";
import isoWeek from "dayjs/plugin/isoWeek";
import moment from "moment";
import classNames from "classnames";
import { DataSourceSync } from "@/pages/api/_lib/data-source/abstract";
import { HolidayDataSourceSync } from "@/pages/api/_lib/data-source/holiday";
import { NameDataSourceSync } from "@/pages/api/_lib/data-source/name/sync";
import { decode62 } from "@/pages/api/_lib/common/base62";
import {
  IconClock,
  IconClose,
  IconComment,
  IconDelete,
  IconDescend,
  IconFeishuLogo,
  IconGift,
  IconGithubLogo,
  IconHelpCircle,
  IconImport,
  IconInfoCircle,
  IconMoon,
  IconRedo,
  IconRefresh,
  IconSun,
  IconUserGroup,
} from "@douyinfe/semi-icons";
import { newVar } from "@/lib/mock";
import {
  Image,
  ImageGroup,
  CollectionData,
  TextPreset,
  TextPresetGroup,
} from "@/lib/collection-types";
import { PROJECT_DOCX } from "@/pages/api/_lib/config";

import("dayjs/locale/en");
import("dayjs/locale/zh");
import("dayjs/locale/ja");

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(localizedFormat);
dayjs.extend(advancedFormat);
dayjs.extend(weekOfYear);
dayjs.extend(isoWeek);

type HbsValCases = {
  name: string;
  dataDutyForceIsSelfPrimary?: boolean;
  bwIsNowWorking?: boolean;
};

interface ConfigFromDoc {
  cases: HbsValCases[];
}
const defaultConfig: ConfigFromDoc = { cases: [] };
function convertTextToData(text: string): {
  image: Image[];
  text: TextPreset[];
  config: ConfigFromDoc | null;
  isSlogan?: boolean;
  targetLink?: string;
  lang?: string;
} {
  if (text.startsWith("//?config"))
    return { image: [], text: [], config: eval(text) };
  let imageResult: Image[] = [];
  let textResult: TextPreset[] = [];
  let mode: TabType = "image";
  let lines = text.split("\n");
  let curDesc = "";
  let curTargetLink = "";
  let curImageKey = "";
  let skipped = false;
  let isSlogan = false;
  let lang = "";
  for (const line of lines) {
    if (skipped) {
      skipped = false;
      continue;
    }
    if (line.startsWith("//")) {
      if (line.startsWith("//->")) {
        curTargetLink = line.slice(4).trim();
      } else if (line.startsWith("//#")) {
        curDesc = line.slice(3).trim();
        mode = "text";
      } else if (line.startsWith("//*")) {
        textResult.push({
          value: "",
          description: line.slice(3).trim(),
          textOnly: true,
        });
      } else if (line.startsWith("//&")) {
        curImageKey = line.slice(3).trim();
      } else if (line.startsWith("//?ignore")) {
        skipped = true;
      } else if (line.startsWith("//?slogan")) {
        isSlogan = true;
      } else if (line.startsWith("//?lang=")) {
        lang = line.slice("//?lang=".length).trim();
      } else {
        curDesc = line.slice(2).trim();
        mode = "image";
      }
    } else if (
      (mode === "image" && line.startsWith("http")) ||
      line.startsWith("img_")
    ) {
      const matchedImageKey = /img_([0-9a-z_-]+)/.exec(line);
      if (matchedImageKey) {
        imageResult.push({
          key: matchedImageKey[0],
          description: curDesc,
          targetLink: curTargetLink,
        });
        curDesc = "";
      }
    } else if (mode === "text") {
      textResult.push({
        value: line,
        description: curDesc,
        targetLink: curTargetLink,
        imageKey: curImageKey,
      });
      curDesc = "";
    }
  }
  // console.log(imageResult);
  return {
    image: imageResult,
    text: textResult,
    config: null,
    isSlogan,
    targetLink: curTargetLink,
    lang,
  };
}

async function getImageCollection(): Promise<CollectionData> {
  // const data = newVar;
  const resp = await fetch("/api/presets-data");
  const data = await resp.json();
  for (let i of data.textPresetResult ?? []) {
    i.blockId = uuidv4();
  }
  for (let i of data.result ?? []) {
    i.blockId = uuidv4();
  }
  return data;
}

export enum EditMode {
  Single = "single",
  Multi = "multi",
}
interface SelectedImg {
  key: string;
  withNewLine?: boolean;
}

function checkFilter(filter: string, text: string) {
  return (
    text.toLocaleLowerCase().includes(filter.toLocaleLowerCase()) ||
    pinyin
      .convertToPinyin(text.toLocaleLowerCase())
      .toLocaleLowerCase()
      .includes(filter.toLocaleLowerCase())
  );
}
function IconGroup({
  inputImgFilter,
  groupMatched,
  group,
  displayImgDescription,
  isDarkMode,
  onLinkClick,
}: {
  inputImgFilter: string;
  groupMatched?: boolean;
  group: ImageGroup;
  displayImgDescription?: boolean;
  isDarkMode?: boolean;
  onLinkClick: (key: string, link?: string) => void;
}) {
  const [display, setDisplay] = useState(false);
  const ref = useRef(null);

  useInViewport(ref, {
    rootMargin: "-64px 0px 0px 0px",
    callback: (entry) => entry.isIntersecting && setDisplay(true),
  });

  return (
    <div style={{ paddingTop: 2, paddingBottom: 12, fontSize: 14 }} ref={ref}>
      {display
        ? (inputImgFilter
            ? groupMatched
              ? group.images
              : group.images.filter((image) =>
                  checkFilter(inputImgFilter, image.description),
                )
            : group.images
          ).map((image, index) => (
            <Tooltip
              content={image.description}
              key={`${index}-${image.key}`}
              position={"topLeft"}
              motion={false}
            >
              <span>
                <Link
                  onClick={() => onLinkClick(image.key, image.targetLink)}
                  iconHref={buildImgKeyUrl(image.key)}
                  text={displayImgDescription ? image.description : ""}
                  isDark={isDarkMode}
                />
              </span>
            </Tooltip>
          ))
        : ""}
    </div>
  );
}

function GroupHeader({
  onClick,
  suffix,
  title,
  kjrSpecial,
  redClickable,
  clickable,
}: {
  redClickable?: boolean;
  clickable?: boolean;
  kjrSpecial: boolean;
  onClick?: () => void;
  title: string;
  suffix: string;
}) {
  return (
    <div
      className={classNames("groupHeader", {
        kjrSpecial,
        redClickable,
        clickable: clickable,
      })}
      onClick={onClick}
    >
      {title}
      {suffix ? (
        <>
          {" "}
          <span style={{ fontSize: "0.7em", color: "var(--text-placeholder)" }}>
            {suffix}
          </span>
        </>
      ) : null}
    </div>
  );
}

function sleep(time: number) {
  return new Promise((resolve) => setTimeout(resolve, time));
}

function ScrollGroup({
  imgGroupData,
  inputImgFilter,
  inputImgFilterMatchGroupName,
  isKjrSpecial,
  hasFallback,
  displayImgDescription,
  isDarkMode,
  onLinkClick,
  mode,
  onImagesClick,
}: {
  imgGroupData: ImageGroup[];
  inputImgFilter: string;
  inputImgFilterMatchGroupName: boolean;
  isKjrSpecial: boolean;
  hasFallback?: boolean;
  displayImgDescription?: boolean;
  isDarkMode?: boolean;
  mode: EditMode;
  onLinkClick: (key: string, link?: string) => void;
  onImagesClick?: (keys: string[], lin?: string) => void;
}) {
  const { t } = useTranslation();

  return (
    <div>
      {imgGroupData.map((group, i) => {
        let groupMatched =
          inputImgFilterMatchGroupName &&
          checkFilter(inputImgFilter, group.name);
        let groupNeedDisplay = inputImgFilter
          ? groupMatched ||
            group.images.some((image) =>
              checkFilter(inputImgFilter, image.description),
            )
          : true;

        let special = group.special;
        let sloganClickable = group.isSlogan && mode === EditMode.Multi;
        return (
          <div
            key={group?.blockId}
            style={{
              display: groupNeedDisplay ? "block" : "none",
            }}
          >
            <GroupHeader
              kjrSpecial={isKjrSpecial}
              onClick={() => {
                if (sloganClickable)
                  onImagesClick?.(
                    group.images.map((i) => i.key),
                    group.targetLink,
                  );
              }}
              title={group.name}
              suffix={
                sloganClickable
                  ? t("一键使用")
                  : group.special
                    ? t("点击查看专区特殊创意")
                    : ""
              }
              redClickable={group.special}
              clickable={sloganClickable}
            />
            <IconGroup
              inputImgFilter={inputImgFilter}
              group={group}
              onLinkClick={onLinkClick}
              groupMatched={groupMatched}
              displayImgDescription={displayImgDescription}
              isDarkMode={isDarkMode}
            ></IconGroup>
          </div>
        );
      })}
      <Skeleton
        active={true}
        loading={hasFallback}
        placeholder={
          <>
            <Skeleton.Paragraph rows={4} style={{ paddingRight: 8 }} />
          </>
        }
      />
    </div>
  );
}

function ScrollTextGroup({
  textGroupData,
  inputImgFilter,
  inputImgFilterMatchGroupName,
  isKjrSpecial,
  hasFallback,
  displayImgDescription,
  isDarkMode,
  onLinkClick,
  userName,
  dataSources,
  currentTime,
}: {
  textGroupData: TextPresetGroup[];
  inputImgFilter: string;
  inputImgFilterMatchGroupName: boolean;
  isKjrSpecial: boolean;
  hasFallback?: boolean;
  displayImgDescription?: boolean;
  isDarkMode?: boolean;
  onLinkClick: (preset: TextPreset) => void;
  userName?: string;
  dataSources: DataSourceSync[];
  currentTime: dayjs.Dayjs;
}) {
  const { t } = useTranslation();
  return (
    <div>
      {textGroupData.map((group) => {
        return (
          <div key={group?.blockId}>
            <GroupHeader
              redClickable={group.special}
              kjrSpecial={isKjrSpecial}
              title={group.name}
              onClick={() => {}}
              suffix={group.special ? t("点击查看专区特殊创意") : ""}
            />
            <div style={{ paddingTop: 2, paddingBottom: 12, fontSize: 14 }}>
              {group.presets.map((preset, index) => (
                <div key={`${index}-${preset.value}`}>
                  {preset.description}
                  {!preset.textOnly && (
                    <Link
                      onClick={() => onLinkClick(preset)}
                      iconHref={
                        preset.imageKey ? buildImgKeyUrl(preset.imageKey) : ""
                      }
                      iconSvg={preset.imageKey ? undefined : addIconSvg}
                      text={
                        processHandlebars({
                          templateText: preset.value,
                          fullName: userName,
                          currentTimeOverride: currentTime,
                          dataSources,
                          demoMode: true,
                        }).result
                      }
                      isDark={isDarkMode}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
      <Skeleton
        active={true}
        loading={hasFallback}
        placeholder={
          <>
            <Skeleton.Paragraph rows={4} style={{ paddingRight: 8 }} />
          </>
        }
      />
    </div>
  );
}

type TabType = "image" | "text";

function getEnableTabs({
  isEventSpecial,
  mode,
}: {
  isEventSpecial: boolean;
  mode: EditMode;
}): TabType[] {
  if (isEventSpecial) {
    if (mode === EditMode.Single) {
      return ["text"];
    } else {
      return ["image"];
    }
  }

  if (mode === EditMode.Single) {
    return ["image", "text"];
  } else {
    return ["image"];
  }
}

function createDataSource() {
  return [new HolidayDataSourceSync(), new NameDataSourceSync()];
}
function pullLangToFirst<T extends { lang?: string }>(
  lang: string,
  originArray: T[],
): T[] {
  let result: T[] = [];

  result.push(...originArray.filter((i) => i.lang === lang));
  result.push(...originArray.filter((i) => i.lang !== lang));

  return result;
}

function ImportDialog({
  visible,
  setInputValue,
  setVisible,
  userName,
  currentTime,
  isDark,
}: {
  visible: boolean;
  setVisible: (value: boolean) => void;
  setInputValue: (p: { text?: string; target?: string; icon?: string }) => void;
  userName?: string;
  currentTime: dayjs.Dayjs;
  isDark: boolean;
}) {
  const [inputLink, setInputLink] = useState("");
  const { t } = useTranslation();
  const [enableImportTarget, setEnableImportTarget] = useState(true);
  const [enableImportRawText, setEnableImportRawText] = useState(true);
  const [enableImportIcon, setEnableImportIcon] = useState(true);
  const {
    validLink,
    previewRenderedText,
    previewRawText,
    previewIcon,
    previewTarget,
  } = useMemo(() => {
    try {
      const url = new URL(inputLink);
      const dataSources: DataSourceSync[] = createDataSource();

      let templateText = url.searchParams.get("t") ?? "";
      try {
        const t2 = url.searchParams.get("t2") ?? "";
        if (t2) {
          templateText = decode62(t2);
        }
      } catch (e) {
        console.log(e);
      }
      let processResult = processHandlebars({
        templateText: templateText,
        fullName: userName,
        currentTimeOverride: currentTime,
        dataSources: dataSources,
        demoMode: true,
      });

      return {
        validLink: true,
        previewRenderedText: processResult.result,
        previewRawText: templateText,
        previewIcon: url.searchParams.get("k") ?? "",
        previewTarget: url.searchParams.get("u") ?? "",
      };
    } catch (e) {
      return { validLink: false };
    }
  }, [inputLink, userName, currentTime]);

  return (
    <Modal
      title={t("导入现有链接")}
      visible={visible}
      onOk={(e) => {
        setInputValue({
          target: enableImportTarget ? previewTarget : undefined,
          text: enableImportRawText ? previewRawText : undefined,
          icon: enableImportIcon ? previewIcon : undefined,
        });
        setVisible(false);
      }}
      okText={t("导入")}
      okButtonProps={{ disabled: !validLink }}
      onCancel={(e) => {
        console.log(e);
        setVisible(false);
      }}
      afterClose={() => {
        setInputLink("");
        setEnableImportTarget(true);
        setEnableImportRawText(true);
        setEnableImportIcon(true);
      }}
    >
      <TextArea
        style={{
          flexGrow: 1,
        }}
        placeholder={t("输入需要导入的链接，目前只支持导入单链接")}
        showClear
        value={inputLink}
        onChange={(v) => setInputLink(v)}
        onPaste={(e) => {
          e.preventDefault();
          let data = e.clipboardData.getData("text/plain");
          if (data) {
            setInputLink(data);
          } else {
            const html = e.clipboardData.getData("text/html");
            let htmlDivElement = document.createElement("div");
            htmlDivElement.innerHTML = html;
            setInputLink(htmlDivElement.innerText);
          }
        }}
      />
      <div>{t("导入预览：")}</div>
      <div>
        <Link
          text={enableImportRawText ? previewRenderedText : ""}
          href={enableImportTarget ? inputLink : ""}
          iconHref={
            enableImportIcon && previewIcon ? buildImgKeyUrl(previewIcon) : ""
          }
          isDark={isDark}
        />
      </div>
      <Space className={"importPreview"} wrap={true}>
        {t("会覆盖这些字段：")}
        {[
          previewTarget && (
            <Tooltip content={previewTarget} position={"bottom"}>
              <Checkbox
                key={"previewTarget"}
                checked={enableImportTarget}
                onChange={() => setEnableImportTarget((v) => !v)}
              >
                {t("跳转目标")}
              </Checkbox>
            </Tooltip>
          ),
          previewRawText && (
            <Tooltip content={previewRawText} position={"bottom"}>
              <Checkbox
                key={"previewRawText"}
                checked={enableImportRawText}
                onChange={() => setEnableImportRawText((v) => !v)}
              >
                {t("链接文案")}
              </Checkbox>
            </Tooltip>
          ),
          previewIcon && (
            <Tooltip content={previewIcon} position={"bottom"}>
              <Checkbox
                key={"previewIcon"}
                checked={enableImportIcon}
                onChange={() => setEnableImportIcon((v) => !v)}
              >
                {t("选择的图标")}
              </Checkbox>
            </Tooltip>
          ),
        ].filter(Boolean)}
      </Space>
    </Modal>
  );
}

function Main({
  isKjrSpecial = false,
  isEventSpecial = false,
  eventSpecialName,
  lang,
}: {
  isKjrSpecial?: boolean;
  isEventSpecial?: boolean;
  eventSpecialName?: string;
  lang: string;
}) {
  const { t } = useTranslation();

  const [mode, _setMode] = useState<EditMode>(EditMode.Single);
  const [isDarkMode, _setIsDarkMode] = useState(
    () => window.matchMedia("(prefers-color-scheme: dark)").matches,
  );

  const setIsDarkMode = useCallback((v: boolean) => {
    _setIsDarkMode(() => {
      document.documentElement.dataset.udThemeMode = v ? "dark" : "light";
      const body = document.body;

      if (!v) {
        body.removeAttribute("theme-mode");
      } else {
        body.setAttribute("theme-mode", "dark");
      }

      return v;
    });
  }, []);

  useEffect(() => {
    if (window.matchMedia("(prefers-color-scheme: dark)").matches)
      setIsDarkMode(true);
  }, []);

  const [inputUrl, setInputUrl] = useResetState(() => "");
  const [inputLinkText, _setInputLinkText] = useResetState(() => "");
  function setInputLinkText(v: string) {
    _setInputLinkText(v);
  }

  const [inputImgFilter, setInputImgFilter] = useState(() => "");
  const [inputImgFilterMatchGroupName, setInputImgFilterMatchGroupName] =
    useState(true);
  const [isEnableBioExpand, setIsEnableBioExpand] = useState(false);

  const [displayImgDescription, setDisplayImgDescription] = useState(false);
  const [selectedImgKeys, setSelectedImgKeys, resetSelectedImgKeys] =
    useResetState<SelectedImg[]>(() => [{ key: "" }]);
  const hasSetActiveTab = useRef(false);

  const { data, run, loading } = useRequest(
    async () => {
      const r = await getImageCollection();

      let result = pullLangToFirst(
        lang,
        r.result.filter((i) => i.images.length),
      );
      let textPresetResult = pullLangToFirst(
        lang,
        r.textPresetResult.filter((i) => i.presets.length),
      );
      if (
        !hasSetActiveTab.current &&
        !result.length &&
        textPresetResult.length
      ) {
        setActiveKey("text");
        hasSetActiveTab.current = true;
      }

      return {
        ...r,
        result: result,
        textPresetResult: textPresetResult,
      };
    },
    { manual: false },
  );

  const imgGroupData = data?.result;
  const textGroupData = data?.textPresetResult;
  const configFromDoc = {} as any;
  const { data: userInfo } = useRequest(
    async () => {
      return { nickName: t("飞书用户"), avatarUrl: "" };
    },
    { manual: false },
  );

  function getText(k: SelectedImg) {
    return mode === EditMode.Single ? inputLinkText : k.withNewLine ? "\n" : "";
  }

  function getUrl() {
    return inputUrl ? inputUrl : mode === EditMode.Single ? "" : "";
  }

  const buildedUrl = selectedImgKeys
    .map((k) =>
      buildCustomPreviewUrl({
        imgKey: k.key,
        text: getText(k),
        url: getUrl(),
        bioExpand: isEnableBioExpand,
      }),
    )
    .join(" ");

  const caseList = configFromDoc?.cases;
  const [selectedDataSet, setSelectedDataSet] = useState<string | undefined>(
    undefined,
  );
  // let currentCase = caseList?.find((i) => i.name === selectedDataSet);

  const [currentTime, setCurrentTime] = useState(dayjs());

  const dataSourcesForPresets: DataSourceSync[] = createDataSource();

  const [activeKey, _setActiveKey] = useState<TabType>(
    isEventSpecial ? "text" : "image",
  );
  const enabledTabs = getEnableTabs({
    mode,
    isEventSpecial: isEventSpecial,
  });

  function setActiveKey(value?: TabType, newEnabledTabs?: TabType[]) {
    let newVar = newEnabledTabs ? newEnabledTabs : enabledTabs;
    if (!value || !newVar.includes(value)) {
      _setActiveKey(newVar[0]);
    } else _setActiveKey(value);
  }

  function setMode(value: EditMode) {
    const newEnabledTabs = getEnableTabs({
      isEventSpecial: isEventSpecial,
      mode: value,
    });

    if (value === EditMode.Single) {
      setInputUrl("");
      resetSelectedImgKeys();
      setActiveKey(undefined, newEnabledTabs);
    } else {
      setInputUrl("");
      setSelectedImgKeys([]);
      setInputLinkText("");
      setActiveKey("image", newEnabledTabs);
    }
    _setMode(value);
  }

  const { inputLinkTextPreview, displayRequirePermission } = useMemo(() => {
    const dataSources: DataSourceSync[] = createDataSource();

    let processResult = processHandlebars({
      templateText: inputLinkText,
      fullName: userInfo?.nickName,
      currentTimeOverride: currentTime,
      dataSources: dataSources,
      demoMode: true,
    });
    let displayRequirePermission = !!dataSources.find(
      (i) => i.used && i.requirePermission,
    );

    return {
      inputLinkTextPreview: processResult.result,
      displayRequirePermission,
    };
  }, [inputLinkText, currentTime]);

  let multiOp = (
    <>
      {mode === EditMode.Multi && (
        <Tooltip position={"bottom"} content={t("清空")}>
          <Button
            type="danger"
            icon={<IconDelete />}
            color={"danger"}
            onClick={() => setSelectedImgKeys([])}
            shape={"square"}
          ></Button>
        </Tooltip>
      )}
      {mode === EditMode.Multi && (
        <Tooltip position={"bottom"} content={t("退格")}>
          <Button
            type="tertiary"
            icon={<IconClose />}
            onClick={() => setSelectedImgKeys(selectedImgKeys.slice(0, -1))}
            shape={"square"}
          ></Button>
        </Tooltip>
      )}
      {mode === EditMode.Multi && (
        <Tooltip position={"bottom"} content={t("换行")}>
          <Button
            type="tertiary"
            icon={<IconRedo rotate={180} />}
            onClick={() => {
              let last = selectedImgKeys[selectedImgKeys.length - 1];

              if (last) {
                setSelectedImgKeys([
                  ...selectedImgKeys.slice(0, -1),
                  { ...last, withNewLine: true },
                ]);
                Toast.info(t("换行成功，可继续添加图标"));
              } else {
                Toast.warning(t("请先添加图标"));
              }
            }}
            shape={"square"}
          ></Button>
        </Tooltip>
      )}
    </>
  );

  let delaySwitch = (
    <Tooltip
      content={
        <>
          {t(
            "保存进签名里后再展开文案，以突破签名字数限制；编辑签名时，待展开的图标会显示为",
          )}{" "}
          <Icon svg={<ExpandIcon />} rotate={180} size={"inherit"} />
        </>
      }
      arrowPointAtCenter={false}
      position="topLeft"
    >
      <div>
        <Space align={"center"} style={{ fontSize: 12 }}>
          {t("延迟")}
          <Switch
            checked={isEnableBioExpand}
            onChange={() => setIsEnableBioExpand(!isEnableBioExpand)}
            size={"small"}
          />
        </Space>
      </div>
    </Tooltip>
  );

  const [importModalVisible, setImportModalVisible] = useState(false);
  const showImportModal = () => setImportModalVisible(true);

  const DatePickerBottomSlot = () => {
    return (
      <div>
        <div>
          <Button
            type="primary"
            onClick={() => {
              setCurrentTime(dayjs());
            }}
          >
            {t("当前时间")}
          </Button>

          <Button
            type="danger"
            onClick={() => {
              setCurrentTime((v) => v.add(-1, "hours"));
            }}
          >
            {t("-1 时")}
          </Button>
          <Button
            type="secondary"
            onClick={() => {
              setCurrentTime((v) => v.add(1, "hours"));
            }}
          >
            {t("+1 时")}
          </Button>
          <Button
            type="danger"
            onClick={() => {
              setCurrentTime((v) => v.add(-1, "day"));
            }}
          >
            {t("-1 天")}
          </Button>

          <Button
            type="secondary"
            onClick={() => {
              setCurrentTime((v) => v.add(1, "day"));
            }}
          >
            {t("+1 天")}
          </Button>
        </div>
      </div>
    );
  };

  return (
    <>
      <div
        style={{
          width: "100%",
          height: "100%",
          maxWidth: "1024px",
          maxHeight: "768px",
          backgroundColor: "var( --semi-color-bg-0)",
          border:
            window.self === window.top ? "1px solid var(--N300)" : undefined,
          borderRadius: 8,
          overflowX: "auto",
          overflowY: "hidden",
          padding: 8,
          // backgroundImage:
          //   'linear-gradient(var(--bg-body),var(--bg-body)),linear-gradient(135deg,rgba(var(--B600-raw),0),rgba(var(--B400-raw),0),rgba(var(--W300-raw),0))',
          // 'linear-gradient(var(#fff), var(#fff)), linear-gradient(135deg, rgba(20,86,240, 0), rgba(80,131,251, 0), rgba(62,195,247, 0))',
          // backgroundClip: 'padding-box, border-box',
          // backgroundOrigin: 'padding-box, border-box',
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "row",
          position: "relative",
        }}
      >
        <div
          style={{
            height: "100%",
            display: "flex",
            flexDirection: "column",
            fontWeight: 400,
            borderRight: "1px solid var(--N300)",
            width: 0,
            flexGrow: 1,
            minWidth: 300,
          }}
        >
          <div style={{ flexShrink: 0, paddingBottom: 8 }}>
            {isEventSpecial ? (
              <Space vertical={true} style={{ width: "100%", paddingRight: 8 }}>
                <div>
                  <span style={{ paddingRight: 8 }}>{t("模式")}</span>
                  <Space>
                    <Radio.Group
                      type="button"
                      value={mode}
                      onChange={(e) => {
                        setMode(String(e) as EditMode);
                      }}
                    >
                      <Radio value={EditMode.Single}>
                        {eventSpecialName || t("活动")}
                      </Radio>
                      <Radio value={EditMode.Multi}>{t("拼字")}</Radio>
                    </Radio.Group>
                    {multiOp}
                  </Space>
                </div>
              </Space>
            ) : (
              <Space
                vertical={true}
                style={{
                  width: "100%",
                  paddingRight: 8,
                  boxSizing: "border-box",
                }}
              >
                <Space
                  style={{ justifyContent: "space-between", width: "100%" }}
                >
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <span style={{ paddingRight: 8 }}>{t("模式")}</span>
                    <Space>
                      <Radio.Group
                        type={"button"}
                        value={mode}
                        onChange={(e) => {
                          setMode(String(e.target.value) as EditMode);
                        }}
                      >
                        <Radio value={EditMode.Single}>{t("单链接")}</Radio>
                        <Radio value={EditMode.Multi}>{t("拼字")}</Radio>
                      </Radio.Group>
                      {multiOp}
                    </Space>
                  </div>
                  <Space>
                    <Tooltip content={t("导入现有链接")} position={"bottom"}>
                      <Button
                        type="tertiary"
                        icon={<IconImport />}
                        onClick={() => showImportModal()}
                        shape={"square"}
                      ></Button>
                    </Tooltip>

                    {/*<Tooltip content={t('历史')} position={'right'}>*/}
                    {/*  <Dropdown overlay={menu}>*/}
                    {/*    <Button type="tertiary"*/}
                    {/*      icon={<IconHelpCircle />}*/}
                    {/*      onClick={() => setSelectedImgKeys([])}*/}
                    {/*      shape={'square'}*/}
                    {/*    ></Button>*/}
                    {/*  </Dropdown>*/}
                    {/*</Tooltip>*/}
                  </Space>
                </Space>
                {mode === EditMode.Single && (
                  <div style={{ display: "flex", width: "100%" }}>
                    <span
                      style={{ flexShrink: 0, paddingTop: 4, paddingRight: 8 }}
                    >
                      {t("跳转目标")}
                    </span>
                    <TextArea
                      style={{
                        flexGrow: 1,
                      }}
                      placeholder={t("https:// 开头，默认为空")}
                      showClear
                      value={inputUrl}
                      onChange={(v) => setInputUrl(v)}
                      autosize={{ minRows: 1, maxRows: 3 }}
                    />
                  </div>
                )}
                {mode === EditMode.Single && (
                  <div style={{ display: "flex", width: "100%" }}>
                    <span
                      style={{ flexShrink: 0, paddingTop: 4, paddingRight: 8 }}
                    >
                      <Space vertical={true} align={"start"}>
                        {t("链接文案")}
                        {delaySwitch}
                      </Space>
                    </span>
                    <TextArea
                      style={{
                        flexGrow: 1,
                      }}
                      placeholder={t(
                        "默认为空，变量结果仅供参考，实际以飞书内为准",
                      )}
                      showClear
                      value={inputLinkText}
                      onChange={(v) => setInputLinkText(v)}
                      autosize={{ minRows: 1, maxRows: 3 }}
                    />
                  </div>
                )}
                <div style={{ display: "flex", width: "100%" }}>
                  <div style={{ paddingTop: 4, paddingRight: 8 }}>
                    {t("图标过滤")}
                  </div>
                  <Space
                    vertical={true}
                    style={{
                      flexGrow: 1,
                    }}
                    align={"start"}
                  >
                    <Input
                      style={{
                        width: "100%",
                      }}
                      placeholder={t("支持拼音查找")}
                      showClear
                      value={inputImgFilter}
                      onChange={(v) => setInputImgFilter(v)}
                    />
                    <Space>
                      <Tooltip content={t("匹配分组标题")}>
                        <div>
                          <Space align={"center"} style={{ fontSize: 12 }}>
                            {t("匹配标题")}
                            <Switch
                              checked={inputImgFilterMatchGroupName}
                              onChange={() =>
                                setInputImgFilterMatchGroupName(
                                  !inputImgFilterMatchGroupName,
                                )
                              }
                              size={"small"}
                            />
                          </Space>
                        </div>
                      </Tooltip>
                      <Tooltip content={t("显示图标描述")}>
                        <div>
                          <Space align={"center"} style={{ fontSize: 12 }}>
                            {t("显示描述")}
                            <Switch
                              checked={displayImgDescription}
                              onChange={() =>
                                setDisplayImgDescription(!displayImgDescription)
                              }
                              size={"small"}
                            />
                          </Space>
                        </div>
                      </Tooltip>
                    </Space>
                  </Space>
                </div>
              </Space>
            )}
          </div>
          <div
            style={{
              height: 0,
              flexGrow: 1,
              WebkitFontSmoothing: "antialiased",
              position: "relative",
            }}
          >
            {loading ? (
              <Skeleton
                active={true}
                loading={loading}
                placeholder={
                  <>
                    <Skeleton.Paragraph rows={8} style={{ paddingRight: 8 }} />
                  </>
                }
              />
            ) : (
              <Tabs
                size={"small"}
                defaultActiveKey={activeKey}
                activeKey={activeKey}
                onChange={(v) => setActiveKey(v as TabType)}
                style={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                }}
                className={"scroll-bar"}
                contentStyle={{ flex: 1, height: 0, overflow: "hidden auto" }}
                tabPaneMotion={false}
              >
                {enabledTabs.includes("image") && imgGroupData?.length ? (
                  <TabPane
                    tab={t("图标")}
                    itemKey={"image"}
                    // style={{ overflowY: "auto", height: "100%" }}
                  >
                    <ScrollGroup
                      imgGroupData={imgGroupData}
                      inputImgFilter={inputImgFilter}
                      inputImgFilterMatchGroupName={
                        inputImgFilterMatchGroupName
                      }
                      isKjrSpecial={isKjrSpecial}
                      hasFallback={loading}
                      displayImgDescription={displayImgDescription}
                      isDarkMode={isDarkMode}
                      onLinkClick={(key: string, link?: string) => {
                        if (mode === EditMode.Single) {
                          setSelectedImgKeys([{ key: key }]);
                          if (link) setInputUrl(link);
                        } else if (mode === EditMode.Multi) {
                          setSelectedImgKeys([
                            ...selectedImgKeys,
                            { key: key },
                          ]);
                          if (link) setInputUrl(link);
                        }
                      }}
                      mode={mode}
                      onImagesClick={(keys: string[], link?: string) => {
                        if (mode === EditMode.Multi) {
                          setSelectedImgKeys(keys.map((i) => ({ key: i })));
                        }
                        if (link) setInputUrl(link);
                      }}
                    ></ScrollGroup>
                  </TabPane>
                ) : null}
                {enabledTabs.includes("text") && textGroupData?.length ? (
                  <TabPane
                    tab={t("文案预设")}
                    itemKey={"text"}
                    // style={{ overflowY: "auto", height: "100%" }}
                  >
                    <ScrollTextGroup
                      textGroupData={textGroupData}
                      inputImgFilter={inputImgFilter}
                      inputImgFilterMatchGroupName={
                        inputImgFilterMatchGroupName
                      }
                      isKjrSpecial={isKjrSpecial}
                      hasFallback={loading}
                      displayImgDescription={displayImgDescription}
                      isDarkMode={isDarkMode}
                      onLinkClick={(preset) => {
                        setInputLinkText(preset.value);
                        if (preset.targetLink) setInputUrl(preset.targetLink);
                        if (preset.imageKey && !selectedImgKeys[0]?.key)
                          setSelectedImgKeys([{ key: preset.imageKey }]);
                      }}
                      userName={userInfo?.nickName}
                      currentTime={currentTime}
                      dataSources={dataSourcesForPresets}
                    ></ScrollTextGroup>
                  </TabPane>
                ) : null}
              </Tabs>
            )}
            {mode === EditMode.Single && (
              <div
                style={{
                  position: "absolute",
                  top: 4,
                  right: 8,
                }}
              >
                <Space>
                  {isEventSpecial && delaySwitch}
                  <div
                    id={"customDatePickerPop"}
                    style={{ position: "relative" }}
                  ></div>
                  <DatePicker
                    position={"bottomRight"}
                    type="dateTime"
                    motion={false}
                    triggerRender={() => (
                      <div>
                        <Tooltip content={t("「时光机」切换预览的时间")}>
                          <Button
                            type="tertiary"
                            icon={<IconClock size={"small"} />}
                            shape="square"
                            size={"small"}
                            onClick={() =>
                              sendEvent({
                                name: "docx_picker_click_time",
                                params: {},
                              })
                            }
                          ></Button>
                        </Tooltip>
                      </div>
                    )}
                    onChange={(v) => {
                      if (v) setCurrentTime(dayjs(Number(v)));
                    }}
                    showClear={true}
                    value={moment(Number(currentTime)).toDate()}
                    dropdownClassName={"customDatePicker"}
                    getPopupContainer={() => {
                      const i = document.body.querySelector(
                        "#customDatePickerPop",
                      ) as HTMLDivElement;
                      return i;
                    }}
                    bottomSlot={<DatePickerBottomSlot />}
                  />
                </Space>
              </div>
            )}
          </div>
        </div>
        <div
          style={{
            //--profile-width
            minWidth: "calc(320px + 12px * 2 + 8px)",
            flexShrink: 0,
            flexGrow: 0,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              paddingLeft: 8,
              paddingTop: 12,
            }}
          >
            <Card
              showNotice={mode === EditMode.Single && displayRequirePermission}
              nickName={userInfo?.nickName}
              avatarUrl={userInfo?.avatarUrl}
              isDark={isDarkMode}
              links={selectedImgKeys.map((k) => {
                return {
                  text:
                    mode === EditMode.Single
                      ? inputLinkTextPreview
                      : getText(k),
                  href: buildCustomPreviewUrl({
                    imgKey: k.key,
                    text: getText(k),
                    url: getUrl(),
                    bioExpand: isEnableBioExpand,
                  }),
                  iconHref: buildImgKeyUrl(k.key),
                };
              })}
              onCopy={async (e) => {
                e.preventDefault();
                if (buildedUrl) {
                  console.log("copy", buildedUrl);
                  try {
                    // const blobPlain = new Blob([buildedUrl], { type: 'text/plain' });
                    let htmlData = selectedImgKeys
                      .map(
                        (k) =>
                          `<div>${buildCustomPreviewUrl({
                            imgKey: k.key,
                            text: getText(k),
                            url: getUrl(),
                            bioExpand: isEnableBioExpand,
                            useTestDomain: e.ctrlKey || e.metaKey,
                          })}</div>`,
                      )
                      .join("");
                    // const blobHtml = new Blob([htmlData], { type: 'text/html' });
                    // const data = [new ClipboardItem({ ['text/plain']: blobPlain, ['text/html']: blobHtml })];
                    // await navigator.clipboard.write(data);

                    const r = copy(htmlData, {
                      format: "text/html",
                    });
                    if (r) {
                      Toast.success(t("复制成功"));
                      sendEvent({
                        name: "docx_picker_copy",
                        params: {
                          docx_picker_mode: mode,
                          docx_picker_copy_success: true,
                          docx_picker_copy_length: selectedImgKeys.length,
                          docx_is_dark_mode: isDarkMode,
                        },
                      });
                    } else {
                      Toast.error(t("复制失败"));
                      sendEvent({
                        name: "docx_picker_copy",
                        params: {
                          docx_picker_mode: mode,
                          docx_picker_copy_success: false,
                          docx_picker_copy_length: selectedImgKeys.length,
                          docx_is_dark_mode: isDarkMode,
                        },
                      });
                    }
                  } catch (e) {
                    Toast.error(t("复制失败"));
                  }
                } else {
                  Toast.error(t("还没有链接"));
                }
              }}
              debugInfo={buildedUrl}
            ></Card>
          </div>
        </div>
        <div style={{ position: "absolute", bottom: 16, right: 16 }}>
          <Space>
            {isEventSpecial ? null : (
              <>
                <Tooltip
                  content={t("通知群")}
                  position={"top"}
                  arrowPointAtCenter={false}
                >
                  <Button
                    type="primary"
                    shape="square"
                    icon={<IconComment />}
                    onClick={() => {
                      window.open(
                        "https://applink.larkoffice.com/client/chat/chatter/add_by_link?link_token=3ech36f8-cd4c-4d4c-afae-50547136d342",
                        "_blank",
                      );
                    }}
                  ></Button>
                </Tooltip>
                <Tooltip
                  content={t("关于")}
                  position={"top"}
                  arrowPointAtCenter={false}
                >
                  <Button
                    type="tertiary"
                    shape="square"
                    icon={<IconInfoCircle />}
                    onClick={() => {
                      window.open(PROJECT_DOCX, "_blank");
                    }}
                  ></Button>
                </Tooltip>

                <Tooltip
                  content={t("项目 GitHub（求 Star～）")}
                  position={"top"}
                  arrowPointAtCenter={false}
                >
                  <Button
                    type="tertiary"
                    shape="square"
                    icon={<IconGithubLogo />}
                    onClick={() => {
                      window.open(
                        "https://github.com/CancerGary/lark-url-preview-public-next",
                        "_blank",
                      );
                    }}
                  ></Button>
                </Tooltip>
                <Tooltip
                  content={t("「爱发电」支持")}
                  position={"top"}
                  arrowPointAtCenter={false}
                >
                  <Button
                    type="tertiary"
                    shape="square"
                    icon={<IconGift />}
                    onClick={() => {
                      window.open("https://afdian.com/a/cancergary", "_blank");
                    }}
                  ></Button>
                </Tooltip>
              </>
            )}

            <Tooltip
              content={
                isDarkMode ? t("深色模式，点击切换") : t("浅色模式，点击切换")
              }
              position={"topRight"}
              arrowPointAtCenter={false}
            >
              <Button
                type="tertiary"
                shape="square"
                icon={isDarkMode ? <IconMoon /> : <IconSun />}
                onClick={() => {
                  setIsDarkMode(!isDarkMode);
                }}
              ></Button>
            </Tooltip>
            <Tooltip
              content={t("刷新（数据清空）")}
              arrowPointAtCenter={false}
              position={"topRight"}
            >
              <Button
                type="tertiary"
                shape="square"
                icon={<IconRefresh />}
                onClick={() => {
                  location.reload();
                }}
              ></Button>
            </Tooltip>
          </Space>
        </div>
      </div>

      <ImportDialog
        visible={importModalVisible}
        setVisible={setImportModalVisible}
        setInputValue={({ text, target, icon }) => {
          console.log({ text, target, icon });
          sendEvent({
            name: "docx_picker_import",
            params: {},
          });
          Toast.info(t("导入完成"));
          if (mode !== EditMode.Single) setMode(EditMode.Single);
          !!text && setInputLinkText(text);
          !!icon && setSelectedImgKeys([{ key: icon }]);
          !!target && setInputUrl(target);
        }}
        userName={userInfo?.nickName}
        currentTime={currentTime}
        isDark={isDarkMode}
      />
    </>
  );
}

let isMobile = mobile();

function checkImageWithImgTag(url: string) {
  return new Promise<boolean>((resolve, reject) => {
    const img = new window.Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

function NewComponent({ lang }: { lang: string }) {
  const { t } = useTranslation();
  const [canAccess, setCanAccess] = useState(false);
  const [loading, setLoading] = useState(true);

  const { run: check } = useRequest(async () => {
    if (canAccess) return;
    const r = await checkImageWithImgTag(
      "https://open.feishu.cn/open-apis/block-kit/image/img_v3_02b2_dc1e30f5-fb57-4e0a-b3fe-b6c1cfb0a32g",
    );
    if (r) {
      setCanAccess(r);
    }
    setLoading(false);
  });

  useEffect(() => {
    function handleVisibilityChange() {
      if (document.visibilityState === "visible") {
        check();
      }
    }

    // 添加visibilitychange事件监听器
    document.addEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  return (
    <div
      style={{
        width: "100vw",
        height: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        boxSizing: "border-box",
        fontSize: "16px",
        background:
          "linear-gradient(to bottom right, var(--minutes-body-background-b1), var(--minutes-body-background-b2), var(--minutes-body-background-b3))",
      }}
    >
      {isMobile ? (
        <Empty
          image={
            <img
              src={
                "https://s3-imfile.feishucdn.com/static-resource/v1/v3_008i_ded00b4c-bf23-4ffb-b04f-b3ab5db15ecg~"
              }
              width={120}
              height={120}
            />
          }
          description={t("图标选择器暂不支持移动端，请前往桌面端使用")}
        />
      ) : loading ? (
        <Spin size={"large"} />
      ) : canAccess ? (
        <Main lang={lang} />
      ) : (
        <Empty
          image={
            <img
              src={
                "https://s3-imfile.feishucdn.com/static-resource/v1/v3_008i_ded00b4c-bf23-4ffb-b04f-b3ab5db15ecg~"
              }
              width={120}
              height={120}
            />
          }
          description={
            <>
              {t("编辑器部分功能依赖飞书登录，请先")}{" "}
              <Typography.Text
                link={{
                  href: "https://accounts.feishu.cn/accounts/page/login?app_id=2&no_trap=1&redirect_uri=https%3A%2F%2Fbcew4xxy7a.feishu.cn%2Fdocx%2FUpJkdVTdao7IwUx46bRcDiahn2D",
                  target: "_blank",
                }}
                style={{ fontSize: "16px" }}
              >
                {t("登录飞书")}
              </Typography.Text>
            </>
          }
        />
      )}
    </div>
  );
}

function App() {
  const [lang, setLang] = useState("en");

  const { t } = useTranslation();

  const { loading } = useRequest(
    async () => {
      const value = navigator.language;
      let lng = value.startsWith("zh") ? "zh" : "en";
      setLang(lng);
      await i18n.changeLanguage(lng);
    },
    { manual: false },
  );

  return (
    <LocaleProvider locale={lang === "en" ? enUS : zhCN}>
      <I18nextProvider i18n={i18n} defaultNS={"translation"}>
        {loading ? null : <NewComponent lang={lang} />}
      </I18nextProvider>
    </LocaleProvider>
  );
}

export default App;
