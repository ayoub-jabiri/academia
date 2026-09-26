import { Check, Plus, Search, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { handleTableActions } from "../../store/slices/classes.slice";
import CreateClassModal from "./CreateClassModal";
import { useEffect } from "react";
import { getMyChildren } from "../../store/slices/guardian.slice";

export default function TableActions({ isAdmin, isParent }) {
    const { search, level, mine, studentId } = useSelector(
        (state) => state.classes.classesList.tableActions
    );
    const { data: myChildrenData } = useSelector(
        (state) => state.guardians.myChildren
    );
    const dispatch = useDispatch();

    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [isFilterOpen, setIsFilterOpen] = useState(false);

    const levelOptions = [
        { value: "", label: "All Levels" },
        { value: "primary", label: "Primary" },
        { value: "middle", label: "Middle" },
        { value: "high", label: "High" },
    ];

    function handleChangeLevelFilter(value) {
        dispatch(handleTableActions({ key: "level", value }));
        setIsFilterOpen(false);
    }

    function handleChangeScope(value) {
        dispatch(handleTableActions({ key: "mine", value }));
    }

    function handleChangeStudentFilter(value) {
        dispatch(handleTableActions({ key: "studentId", value }));
    }

    useEffect(() => {
        if (isParent) {
            dispatch(getMyChildren());
        }
    }, [dispatch, isParent]);

    return (
        <>
            <div className="flex items-center gap-2 max-lg:flex-col max-md:items-end">
                <div className="relative max-lg:w-full">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                    <input
                        value={search}
                        onChange={(e) =>
                            dispatch(
                                handleTableActions({
                                    key: "search",
                                    value: e.target.value,
                                })
                            )
                        }
                        placeholder="Search by level, year, or group..."
                        className="w-70 max-lg:w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm text-slate-600 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                    />
                </div>

                <div className="flex gap-3">
                    {isParent && (
                        <select
                            value={studentId}
                            onChange={(e) =>
                                handleChangeStudentFilter(e.target.value)
                            }
                            className="rounded-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-600 outline-none transition focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                        >
                            <option value="">All Classes</option>
                            {myChildrenData?.children?.map((child) => (
                                <option key={child._id} value={child._id}>
                                    {child.fullName}'s Classes
                                </option>
                            ))}
                        </select>
                    )}

                    {!isAdmin && !isParent && (
                        <div className="flex items-center rounded-full border border-slate-200 bg-white p-0.5 text-xs">
                            <button
                                onClick={() => handleChangeScope(false)}
                                className={`rounded-full px-3 py-1.5 transition cursor-pointer ${
                                    !mine
                                        ? "bg-slate-900 text-white"
                                        : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                All Classes
                            </button>

                            <button
                                onClick={() => handleChangeScope(true)}
                                className={`rounded-full px-3 py-1.5 transition cursor-pointer ${
                                    mine
                                        ? "bg-slate-900 text-white"
                                        : "text-slate-500 hover:text-slate-700"
                                }`}
                            >
                                My Classes
                            </button>
                        </div>
                    )}
                    <div className="relative">
                        <button
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-sky-100 text-sky-600 transition hover:bg-sky-200 cursor-pointer"
                            onClick={() => setIsFilterOpen((open) => !open)}
                            title="Filter"
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                        </button>

                        {isFilterOpen && (
                            <>
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsFilterOpen(false)}
                                />

                                <div className="absolute right-0 z-20 mt-2 w-40 rounded-xl border border-slate-100 bg-white p-1.5 shadow-lg">
                                    <p className="px-2 pb-1 pt-1 text-xs font-semibold text-slate-400">
                                        Filter by level
                                    </p>

                                    {levelOptions.map((option) => (
                                        <button
                                            key={option.value}
                                            onClick={() =>
                                                handleChangeLevelFilter(
                                                    option.value
                                                )
                                            }
                                            className={`flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-left text-sm transition hover:bg-slate-50 cursor-pointer ${
                                                level === option.value
                                                    ? "font-semibold text-slate-900"
                                                    : "text-slate-600"
                                            }`}
                                        >
                                            {option.label}
                                            {level === option.value && (
                                                <Check className="h-3.5 w-3.5 text-sky-500" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}
                    </div>
                    {isAdmin && (
                        <button
                            className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-400 text-white transition hover:bg-amber-500 cursor-pointer"
                            onClick={() => setIsRegisterOpen(true)}
                            title="Register new class"
                        >
                            <Plus className="h-4 w-4" />
                        </button>
                    )}
                </div>
            </div>

            {isAdmin && (
                <CreateClassModal
                    isOpen={isRegisterOpen}
                    onClose={() => setIsRegisterOpen(false)}
                />
            )}
        </>
    );
}
