import React, { useMemo, useState, useRef, useEffect } from "react";
import {
	View,
	Text,
	StyleSheet,
	ScrollView,
	TouchableOpacity,
	TextInput,
	Pressable,
	Image,
	ImageBackground,
	Dimensions,
	Platform,
} from "react-native";
import { Ionicons, Feather, MaterialCommunityIcons } from "@expo/vector-icons";
declare const require: any;

const bgSplash = require("../assets/bgSplash.png");
const arrowLeft = require("../assets/Arrow - Left.png");

type Step = 1 | 2 | 3;

type Member = {
	id: number;
	name: string;
	role: "Trưởng ban" | "Phó trưởng ban" | "Thành viên";
};

const STEP_COUNT = 3;

const MEMBER_ROLES: Member["role"][] = [
	"Trưởng ban",
	"Phó trưởng ban",
	"Thành viên",
];

const MEMBERS: Member[] = [
	{ id: 1, name: "Thành viên 1", role: "Trưởng ban" },
	{ id: 2, name: "Thành viên 2", role: "Phó trưởng ban" },
	{ id: 3, name: "Thành viên 3", role: "Thành viên" },
	{ id: 4, name: "Thành viên 4", role: "Thành viên" },
	{ id: 5, name: "Thành viên 5", role: "Thành viên" },
];

const SUGGESTED_MEMBERS = [
	"Thành viên 6",
	"Thành viên 7",
	"Thành viên 8",
	"Thành viên 9",
	"Thành viên 10",
	"Thành viên 11",
	"Thành viên 12",
	"Thành viên 13",
	"Thành viên 14",
	"Thành viên 15",
	"Thành viên 16",
];

function Stepper({ currentStep }: { currentStep: Step }) {
	return (
		<View style={styles.stepperWrap}>
			<View style={styles.stepLine} />
			<View style={styles.stepRow}>
				{[1, 2, 3].map((step) => {
					const active = step <= currentStep;
					return (
						<View key={step} style={styles.stepBubbleWrap}>
							<View style={[styles.stepBubble, active && styles.stepBubbleActive]}>
								<Text style={[styles.stepBubbleText, active && styles.stepBubbleTextActive]}>
									{step}
								</Text>
							</View>
						</View>
					);
				})}
			</View>
		</View>
	);
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
	return (
		<View style={styles.card}>
			{title ? <Text style={styles.cardTitle}>{title}</Text> : null}
			{title ? <View style={styles.cardDivider} /> : null}
			{children}
		</View>
	);
}

function UploadBox({ icon, label }: { icon: React.ReactNode; label: string }) {
	return (
		<View style={styles.uploadBox}>
			<View style={styles.uploadInner}>
				{icon}
				<Text style={styles.uploadLabel}>{label}</Text>
			</View>
		</View>
	);
}

export default function CreateEvent({ navigation }: any) {
	const [step, setStep] = useState<Step>(1);
	const [startDate, setStartDate] = useState<string>("");
	const [endDate, setEndDate] = useState<string>("");
	const [members, setMembers] = useState<Member[]>(MEMBERS);
	const [showMemberSearch, setShowMemberSearch] = useState(false);
	const [memberSearch, setMemberSearch] = useState("");
	const [activeRoleMenuId, setActiveRoleMenuId] = useState<number | null>(null);
	const [roleMenuPosition, setRoleMenuPosition] = useState<null | { x: number; y: number; width: number; height: number }>(null);
	const pillRefs = useRef<Record<number, any>>({});
	const scrollRef = useRef<ScrollView | null>(null);
	const [eventName, setEventName] = useState("");
	const [description, setDescription] = useState("");

	const filteredSuggestions = useMemo(() => {
		const query = memberSearch.trim().toLowerCase();
		if (!query) {
			return SUGGESTED_MEMBERS;
		}
		return SUGGESTED_MEMBERS.filter((name) => name.toLowerCase().includes(query));
	}, [memberSearch]);

	const filteredMembers = useMemo(() => {
		const query = memberSearch.trim().toLowerCase();
		if (!query) {
			return members;
		}
		return members.filter((member) => member.name.toLowerCase().includes(query));
	}, [memberSearch, members]);

	const formatDateInput = (text: string) => {
		const digits = text.replace(/\D/g, "");
		const d = digits.slice(0, 2);
		const m = digits.slice(2, 4);
		const y = digits.slice(4, 8);
		let out = d;
		if (m.length) out += '/' + m;
		if (y.length) out += '/' + y;
		return out;
	};

	const goNext = () => setStep((current) => Math.min(STEP_COUNT, current + 1) as Step);

	const goBack = () => {
		if (step === 1) {
			navigation?.goBack?.();
			return;
		}

		setStep((current) => Math.max(1, current - 1) as Step);
	};

	const handlePrimaryAction = () => {
		if (step < STEP_COUNT) {
			goNext();
			return;
		}

		navigation?.navigate?.("Main", { screen: "Home" });
	};

	useEffect(() => {
		if (scrollRef.current && scrollRef.current.scrollTo) {
			scrollRef.current.scrollTo({ y: 0, animated: true });
		}
	}, [step]);

	const renderStepOne = () => (
		<>
			<SectionCard title="Tên sự kiện">
				<TextInput
					placeholder="Tên sự kiện"
					placeholderTextColor={stylesTokens.placeholder}
					value={eventName}
					onChangeText={setEventName}
					style={styles.input}
				/>
			</SectionCard>

			<SectionCard title="Ngày">
				<TextInput
					placeholder="Ngày bắt đầu"
					placeholderTextColor={stylesTokens.placeholder}
					value={startDate}
					onChangeText={(v) => setStartDate(formatDateInput(v))}
					style={styles.input}
				/>
				<View style={styles.rowDivider} />
				<TextInput
					placeholder="Ngày kết thúc"
					placeholderTextColor={stylesTokens.placeholder}
					value={endDate}
					onChangeText={(v) => setEndDate(formatDateInput(v))}
					style={styles.input}
				/>
			</SectionCard>

			<SectionCard title="Mô tả">
				<TextInput
					placeholder="Mô tả"
					placeholderTextColor={stylesTokens.placeholder}
					value={description}
					onChangeText={setDescription}
					style={[styles.input, styles.descriptionInput]}
					multiline
					numberOfLines={5}
				/>
			</SectionCard>
		</>
	);

	const renderStepTwo = () => (
		<>
			<SectionCard title="Logo">
				<UploadBox
					icon={<Feather name="image" size={70} color={stylesTokens.softPrimary} />}
					label="Tải ảnh"
				/>
			</SectionCard>

			<SectionCard title="Bản đồ">
				<UploadBox
					icon={<MaterialCommunityIcons name="map-outline" size={74} color={stylesTokens.softPrimary} />}
					label="Tải ảnh"
				/>
			</SectionCard>
		</>
	);

	const renderStepThree = () => (
		<>
			<SectionCard title="Thành viên">
				<Pressable style={styles.searchField} onPress={() => setShowMemberSearch(true)}>
					<TextInput
						placeholder="Tìm kiếm"
						placeholderTextColor={stylesTokens.softPrimary}
						value={memberSearch}
						onChangeText={(text: string) => {
							setMemberSearch(text);
							setShowMemberSearch(true);
						}}
						onFocus={() => setShowMemberSearch(true)}
						style={styles.searchInput}
					/>
					<Ionicons name="search" size={30} color={stylesTokens.softPrimary} />
				</Pressable>

				{showMemberSearch ? (
					<Pressable style={styles.memberSearchBackdrop} onPress={() => setShowMemberSearch(false)}>
						<Pressable style={styles.memberSearchOverlay} onPress={() => {}}>
							<View style={styles.memberSearchTop}>
								<TextInput
									value={memberSearch}
									onChangeText={setMemberSearch}
									placeholder="Tìm kiếm"
									placeholderTextColor={stylesTokens.darkText}
									style={styles.memberSearchTopInput}
								/>
								<Ionicons name="search" size={30} color={stylesTokens.primary} />
							</View>
							<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.memberSearchList}>
								{filteredSuggestions.map((name) => (
									<View key={name} style={styles.memberSearchRow}>
										<Text style={styles.memberSearchName}>{name}</Text>
										<TouchableOpacity
											style={styles.addButton}
											onPress={() => {
												const nextId = Math.max(0, ...members.map((m) => m.id)) + 1;
												setMembers((cur) => [...cur, { id: nextId, name, role: "Thành viên" }]);
												setShowMemberSearch(false);
												setMemberSearch("");
											}}
										>
											<Text style={styles.addButtonText}>+Thêm</Text>
										</TouchableOpacity>
									</View>
								))}
							</ScrollView>
						</Pressable>
					</Pressable>
				) : null}

				<View style={styles.memberList}>
					{filteredMembers.map((member) => {
						const isActive = activeRoleMenuId === member.id;
						return (
							<View key={member.id} style={styles.memberRow}>
								<Text style={styles.memberName}>{member.name}</Text>
								<View
									ref={(ref) => { pillRefs.current[member.id] = ref; }}
									style={styles.rolePillWrap}
								>
									<TouchableOpacity
										style={[styles.rolePill, isActive && styles.rolePillActive]}
										onPress={() => {
											const ref = pillRefs.current[member.id];
											if (ref && ref.measureInWindow) {
												ref.measureInWindow((x: number, y: number, width: number, height: number) => {
													setRoleMenuPosition({ x, y, width, height });
													setActiveRoleMenuId((current) => (current === member.id ? null : member.id));
												});
											} else {
												setActiveRoleMenuId((current) => (current === member.id ? null : member.id));
											}
										}}
									>
										<Text style={[styles.rolePillText, isActive && styles.rolePillTextActive]}>
											{member.role}
										</Text>
										<View style={[styles.caret, isActive && styles.caretUp]} />
									</TouchableOpacity>
								</View>
							</View>
						);
					})}
				</View>
			</SectionCard>
		</>
	);

	return (
		<ImageBackground
			source={bgSplash}
			style={styles.background}
			resizeMode="cover"
		>
			<View style={styles.page}>
				<View style={styles.header}>
					<TouchableOpacity onPress={() => navigation?.goBack?.()} style={styles.backButton}>
						<Image
							source={arrowLeft}
							style={styles.backIcon}
							tintColor={stylesTokens.darkText}
						/>
					</TouchableOpacity>
					<Text style={styles.title}>SỰ KIỆN MỚI</Text>
					<View style={styles.headerSpacer} />
				</View>

				<Stepper currentStep={step} />

				<ScrollView ref={(r) => { scrollRef.current = r; }} showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
					{step === 1 ? renderStepOne() : null}
					{step === 2 ? renderStepTwo() : null}
					{step === 3 ? renderStepThree() : null}
				</ScrollView>

				<View style={styles.footer}>
					<View style={styles.footerButtons}>
						<TouchableOpacity style={styles.secondaryButton} onPress={goBack}>
							<Text style={styles.secondaryButtonText}>QUAY LẠI</Text>
						</TouchableOpacity>

						<TouchableOpacity style={styles.primaryButton} onPress={handlePrimaryAction}>
							<Text style={styles.primaryButtonText}>{step === 3 ? "HOÀN THÀNH" : "TIẾP TỤC"}</Text>
						</TouchableOpacity>
					</View>
				</View>
			</View>
				<RoleMenuOverlay
					visible={!!activeRoleMenuId}
					position={roleMenuPosition}
					activeId={activeRoleMenuId}
					onClose={() => setActiveRoleMenuId(null)}
					onSelect={(r) => {
						setMembers((cur) => cur.map((m) => (m.id === activeRoleMenuId ? { ...m, role: r } : m)));
						setActiveRoleMenuId(null);
					}}
				/>
			</ImageBackground>
	);
}

function RoleMenuOverlay({
	visible,
	position,
	onClose,
	onSelect,
	activeId,
}: {
	visible: boolean;
	position: { x: number; y: number; width: number; height: number } | null;
	onClose: () => void;
	onSelect: (role: Member["role"]) => void;
	activeId: number | null;
}) {
	if (!visible || !position || !activeId) return null;
	const { width: screenWidth } = Dimensions.get("window");
	const menuWidth = 180;
	let left = position.x + position.width - menuWidth;
	if (left < 8) left = 8;
	if (left + menuWidth > screenWidth - 8) left = screenWidth - menuWidth - 8;
	const top = position.y + position.height + 6;

	return (
		<Pressable style={styles.overlayBackdrop} onPress={onClose}>
				<View style={[styles.roleMenuInline, { position: "absolute", left, top }]}> 
					{MEMBER_ROLES.map((r, idx) => {
						const last = idx === MEMBER_ROLES.length - 1;
						return (
							<TouchableOpacity key={r} onPress={() => onSelect(r)} style={[styles.roleMenuItem, last && styles.roleMenuItemLast]}>
								<Text style={styles.roleMenuItemText}>{r}</Text>
							</TouchableOpacity>
						);
					})}
				</View>
		</Pressable>
	);
}

const stylesTokens = {
	primary: "#6236FF",
	softPrimary: "#A58CF5",
	darkText: "#23232D",
	placeholder: "#B8B8C2",
	card: "#FFFFFF",
	divider: "#E7E0FF",
	footer: "#EAE2FF",
	pageBg: "#FBFAFF",
};

const styles = StyleSheet.create({
	background: {
		flex: 1,
		width: "100%",
		height: "100%",
		backgroundColor: stylesTokens.pageBg,
	},
	memberRowWrap: {
		gap: 8,
		position: "relative",
		paddingVertical: 8,
	},
	page: {
		flex: 1,
		paddingTop: 36,
	},
	header: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 28,
		marginBottom: 26,
	},
	backButton: {
		width: 44,
		height: 44,
		justifyContent: "center",
		alignItems: "flex-start",
	},
	backIcon: {
		width: 28,
		height: 28,
	},
	title: {
		fontSize: 27,
		fontWeight: "800",
		letterSpacing: 0.5,
		color: stylesTokens.darkText,
	},
	headerSpacer: {
		width: 44,
	},
	stepperWrap: {
		alignItems: "center",
		justifyContent: "center",
		marginBottom: 18,
		paddingHorizontal: 28,
	},
	stepLine: {
		position: "absolute",
		top: 24,
		left: 112,
		right: 112,
		height: 3,
		backgroundColor: stylesTokens.divider,
		borderRadius: 999,
	},
	stepRow: {
		flexDirection: "row",
		justifyContent: "space-between",
		width: "100%",
	},
	stepBubbleWrap: {
		width: 72,
		alignItems: "center",
	},
	stepBubble: {
		width: 56,
		height: 56,
		borderRadius: 28,
		backgroundColor: "#E9E3FF",
		alignItems: "center",
		justifyContent: "center",
	},
	stepBubbleActive: {
		backgroundColor: stylesTokens.primary,
	},
	stepBubbleText: {
		fontSize: 24,
		fontWeight: "700",
		color: stylesTokens.primary,
	},
	stepBubbleTextActive: {
		color: "#FFFFFF",
	},
	scrollContent: {
		paddingHorizontal: 26,
		paddingBottom: 160,
		gap: 18,
	},
	input: {
		backgroundColor: "rgba(255,255,255,0.92)",
		borderRadius: 28,
		minHeight: 72,
		paddingHorizontal: 34,
		color: stylesTokens.darkText,
		fontSize: 32,
		borderWidth: 3,
		borderColor: stylesTokens.primary,
	},
	descriptionInput: {
		minHeight: 140,
		paddingTop: 18,
		paddingBottom: 18,
		paddingHorizontal: 34,
		textAlignVertical: "top",
	},
	webDateWrap: {
		flexDirection: "row",
		justifyContent: "space-between",
		marginTop: 10,
		gap: 12,
	},
	webDateInput: {
		width: "48%",
		backgroundColor: "rgba(255,255,255,0.92)",
		borderRadius: 20,
		minHeight: 66,
		paddingHorizontal: 18,
		color: stylesTokens.darkText,
		fontSize: 24,
		borderWidth: 3,
		borderColor: stylesTokens.primary,
	},
	card: {
		backgroundColor: stylesTokens.card,
		borderRadius: 30,
		paddingHorizontal: 28,
		paddingTop: 20,
		paddingBottom: 22,
		shadowColor: "#8F7EF7",
		shadowOpacity: 0.16,
		shadowRadius: 20,
		shadowOffset: { width: 0, height: 16 },
		elevation: 4,
		overflow: "visible",
	},
	cardTitle: {
		fontSize: 30,
		lineHeight: 38,
		color: "#121212",
		marginBottom: 10,
	},
	cardDivider: {
		height: 2,
		backgroundColor: stylesTokens.divider,
		marginHorizontal: -2,
		marginBottom: 14,
	},
	rowDivider: {
		height: 2,
		backgroundColor: stylesTokens.divider,
		marginVertical: 14,
	},
	dateRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
	},
	dateLabel: {
		fontSize: 27,
		color: "#111111",
	},
	dateChip: {
		backgroundColor: "#E9E3FF",
		paddingHorizontal: 18,
		paddingVertical: 10,
		borderRadius: 16,
	},
	dateChipActive: {
		backgroundColor: "#DDD2FF",
	},
	dateChipText: {
		fontSize: 24,
		color: "#111111",
	},
	dateChipTextActive: {
		fontSize: 24,
		color: stylesTokens.primary,
	},
	uploadBox: {
		borderRadius: 28,
		borderWidth: 2,
		borderColor: "#BCA8FF",
		borderStyle: "dashed",
		minHeight: 390,
		alignItems: "center",
		justifyContent: "center",
		padding: 18,
		backgroundColor: "rgba(255,255,255,0.35)",
	},
	uploadInner: {
		alignItems: "center",
		justifyContent: "center",
		gap: 8,
	},
	uploadLabel: {
		color: stylesTokens.softPrimary,
		fontSize: 30,
	},
	searchField: {
		borderWidth: 4,
		borderColor: "#BCA8FF",
		borderRadius: 30,
		height: 66,
		paddingLeft: 40,
		paddingRight: 20,
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		backgroundColor: "rgba(245,240,255,0.72)",
		marginBottom: 26,
	},
	searchInput: {
		flex: 1,
		fontSize: 28,
		color: stylesTokens.softPrimary,
	},
	memberList: {
		gap: 0,
	},
	memberRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingVertical: 14,
		borderBottomWidth: 2,
		borderBottomColor: stylesTokens.divider,
		position: "relative",
		overflow: "visible",
	},
	memberName: {
		fontSize: 30,
		color: "#111111",
		flex: 1,
		paddingRight: 12,
	},
	rolePill: {
		flexDirection: "row",
		alignItems: "center",
		gap: 8,
		paddingVertical: 10,
		paddingLeft: 18,
		paddingRight: 12,
		borderRadius: 20,
	},
	rolePillActive: {
		backgroundColor: "#EFE8FF",
		borderWidth: 2,
		borderColor: stylesTokens.primary,
	},
	rolePillText: {
		fontSize: 28,
		color: "#111111",
	},
	rolePillTextActive: {
		color: stylesTokens.primary,
	},
	caret: {
		width: 0,
		height: 0,
		borderLeftWidth: 10,
		borderRightWidth: 10,
		borderTopWidth: 14,
		borderLeftColor: "transparent",
		borderRightColor: "transparent",
		borderTopColor: "#1C1737",
	},
	caretUp: {
		borderTopWidth: 0,
		borderBottomWidth: 14,
		borderTopColor: "transparent",
		borderBottomColor: stylesTokens.primary,
	},
	memberSearchOverlay: {
		position: "absolute",
		top: 84,
		left: 20,
		right: 20,
		zIndex: 20,
		backgroundColor: "rgba(236,230,255,0.95)",
		borderRadius: 30,
		borderWidth: 4,
		borderColor: stylesTokens.primary,
		overflow: "hidden",
	},
	memberSearchBackdrop: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 19,
		backgroundColor: "transparent",
		justifyContent: "flex-start",
		alignItems: "center",
	},
	roleMenuInline: {
		position: "absolute",
		backgroundColor: "#FFFFFF",
		borderRadius: 16,
		borderWidth: 2,
		borderColor: stylesTokens.primary,
		width: 180,
		paddingVertical: 6,
		elevation: 50,
		zIndex: 100000,
		shadowColor: "#000",
		shadowOpacity: 0.18,
		shadowRadius: 12,
		shadowOffset: { width: 0, height: 8 },
	},
	overlayBackdrop: {
		position: "absolute",
		top: 0,
		left: 0,
		right: 0,
		bottom: 0,
		zIndex: 100001,
	},
	rolePillWrap: {
		position: "relative",
		alignItems: "flex-end",
		justifyContent: "flex-start",
	},
	memberSearchTop: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 30,
		paddingVertical: 10,
		backgroundColor: "rgba(245,240,255,0.95)",
		borderBottomWidth: 4,
		borderBottomColor: stylesTokens.primary,
		borderTopLeftRadius: 30,
		borderTopRightRadius: 30,
	},
	memberSearchTopInput: {
		flex: 1,
		fontSize: 28,
		color: stylesTokens.darkText,
		paddingRight: 12,
	},
	memberSearchList: {
		paddingBottom: 14,
	},
	memberSearchRow: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 30,
		paddingVertical: 12,
		borderBottomWidth: 2,
		borderBottomColor: "rgba(123,98,226,0.16)",
	},
	memberSearchName: {
		fontSize: 28,
		color: stylesTokens.darkText,
	},
	addButton: {
		borderWidth: 2,
		borderColor: stylesTokens.primary,
		borderRadius: 20,
		paddingHorizontal: 14,
		paddingVertical: 6,
	},
	addButtonText: {
		fontSize: 22,
		color: stylesTokens.primary,
	},
	roleMenu: {
		position: "absolute",
		right: 0,
		bottom: 74,
		width: 250,
		backgroundColor: "#FFFFFF",
		borderRadius: 30,
		borderWidth: 3,
		borderColor: stylesTokens.primary,
		overflow: "hidden",
		elevation: 8,
	},
	roleMenuHeader: {
		flexDirection: "row",
		alignItems: "center",
		justifyContent: "space-between",
		paddingHorizontal: 22,
		paddingVertical: 10,
		backgroundColor: "#F2ECFF",
		borderBottomWidth: 2,
		borderBottomColor: stylesTokens.divider,
	},
	roleMenuHeaderText: {
		fontSize: 24,
		color: stylesTokens.darkText,
	},
	roleMenuCaret: {
		width: 0,
		height: 0,
		borderLeftWidth: 10,
		borderRightWidth: 10,
		borderBottomWidth: 16,
		borderLeftColor: "transparent",
		borderRightColor: "transparent",
		borderBottomColor: stylesTokens.primary,
	},
	roleMenuItem: {
		alignItems: "center",
		paddingVertical: 10,
		borderBottomWidth: 2,
		borderBottomColor: stylesTokens.divider,
	},
	roleMenuItemLast: {
		borderBottomWidth: 0,
	},
	roleMenuItemText: {
		fontSize: 24,
		color: stylesTokens.darkText,
	},
	footer: {
		backgroundColor: stylesTokens.footer,
		paddingHorizontal: 24,
		paddingTop: 18,
		paddingBottom: 28,
		borderTopLeftRadius: 34,
		borderTopRightRadius: 34,
	},
	footerButtons: {
		flexDirection: "row",
		gap: 18,
	},
	secondaryButton: {
		flex: 1,
		borderRadius: 28,
		borderWidth: 5,
		borderColor: stylesTokens.primary,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 18,
		backgroundColor: "rgba(255,255,255,0.15)",
	},
	secondaryButtonText: {
		fontSize: 24,
		color: stylesTokens.primary,
	},
	primaryButton: {
		flex: 1,
		borderRadius: 28,
		backgroundColor: stylesTokens.primary,
		alignItems: "center",
		justifyContent: "center",
		paddingVertical: 18,
	},
	primaryButtonText: {
		fontSize: 24,
		color: "#FFFFFF",
	},
});
