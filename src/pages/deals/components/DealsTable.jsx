import React, { useState, useMemo } from "react";
import Icon from "../../../components/AppIcon";
import Button from "../../../components/ui/Button";
import { Checkbox } from "../../../components/ui/Checkbox";

const DealsTable = ({
  deals,
  selectedDeals,
  onSelectDeal,
  onSelectAll,
  onDealClick,
  sortConfig,
  onSort,
  currentPage,
  itemsPerPage,
  onPromoteLead,
  onDeleteLead,
}) => {
  const [hoveredRow, setHoveredRow] = useState(null);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })?.format(amount);
  };

  const formatDate = (date) => {
    if (!date) return "-";

    // If date is a Firestore Timestamp, convert it
    const dateObj = date.toDate ? date.toDate() : new Date(date);

    return dateObj.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStageColor = (stage) => {
    const colors = {
      New: "bg-blue-100 text-blue-800",
      Qualified: "bg-yellow-100 text-yellow-800",
      Proposal: "bg-purple-100 text-purple-800",
      Negotiation: "bg-orange-100 text-orange-800",
      Won: "bg-green-100 text-green-800",
      Lost: "bg-red-100 text-red-800",
    };
    return colors?.[stage] || "bg-gray-100 text-gray-800";
  };

  const getProbabilityColor = (probability) => {
    if (probability >= 80) return "text-green-600";
    if (probability >= 60) return "text-yellow-600";
    if (probability >= 40) return "text-orange-600";
    return "text-red-600";
  };

  const getSortIcon = (column) => {
    if (sortConfig?.key !== column) {
      return (
        <Icon name="ArrowUpDown" size={16} className="text-muted-foreground" />
      );
    }
    return sortConfig?.direction === "asc" ? (
      <Icon name="ArrowUp" size={16} className="text-primary" />
    ) : (
      <Icon name="ArrowDown" size={16} className="text-primary" />
    );
  };

  const handleQuickAction = (e, action, deal) => {
    e.stopPropagation();

    if (action === "promote") {
      onPromoteLead(deal);
    }

    if (action === "delete") {
      onDeleteLead(deal.id);
    }
  };

  const paginatedDeals = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return deals?.slice(startIndex, startIndex + itemsPerPage);
  }, [deals, currentPage, itemsPerPage]);

  const isAllSelected =
    selectedDeals?.length === paginatedDeals?.length &&
    paginatedDeals?.length > 0;
  const isIndeterminate =
    selectedDeals?.length > 0 && selectedDeals?.length < paginatedDeals?.length;

  return (
    <div className="bg-card border border-border rounded-lg overflow-hidden">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto max-h-[500px] overflow-y-auto">
        <table className="w-full">
          <thead className="bg-muted/95 border-b border-border sticky top-0 z-10">
            <tr>
              <th className="w-12 px-4 py-3">
                <Checkbox
                  checked={isAllSelected}
                  indeterminate={isIndeterminate}
                  onChange={(e) => onSelectAll(e?.target?.checked)}
                />
              </th>
              <th className="text-left px-4 py-3">
                <button>
                  <span>Title</span>
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button>
                  <span>Name</span>
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button>
                  <span>Company</span>
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button>
                  <span>Email</span>
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button>
                  <span>Mobile</span>
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => onSort("source")}
                  className="flex items-center space-x-2 text-foreground"
                >
                  <span>Source</span>
                  {getSortIcon("source")}
                </button>
              </th>
              <th className="text-left px-4 py-3">
                <button
                  onClick={() => onSort("createdAt")}
                  className="flex items-center space-x-2 text-foreground"
                >
                  <span>Date Added</span>
                  {getSortIcon("createdAt")}
                </button>
              </th>
              <th className="w-24 pl-4 pr-8 py-3">
                <span>Actions</span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {paginatedDeals?.map((deal) => (
              <tr
                key={deal?.id}
                onClick={() => onDealClick(deal)}
                onMouseEnter={() => setHoveredRow(deal?.id)}
                onMouseLeave={() => setHoveredRow(null)}
                className="hover:bg-muted/30 cursor-pointer transition-smooth"
              >
                <td className="px-4 py-4">
                  <Checkbox
                    checked={selectedDeals?.includes(deal?.id)}
                    onChange={(e) => {
                      e?.stopPropagation();
                      onSelectDeal(deal?.id, e?.target?.checked);
                    }}
                  />
                </td>
                <td className="px-4 py-4">
                  <div className="font-medium text-foreground">
                    {deal?.title}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-foreground">{deal?.name}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-medium text-foreground">
                    {deal?.company}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-medium text-foreground">
                    {deal?.email}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="font-medium text-foreground">
                    {deal?.mobile}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-foreground">{deal?.source}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm font-medium">
                    {formatDate(deal?.createdAt)}
                  </div>
                </td>
                <td className="px-4 py-4">
                  <div
                    className={`flex items-center space-x-1`}
                  >
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onPromoteLead(deal);
                      }}
                    >
                      <Icon name="ArrowRight" size={14} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteLead(deal.id);
                      }}
                    >
                      <Icon name="Trash2" size={14} />
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {/* Mobile Cards */}
      <div className="lg:hidden space-y-4 p-4">
        <h1 className="text-2xl text-center text-foreground font-bold">
          Please Open in Desktop View
        </h1>
      </div>
    </div>
  );
};

export default DealsTable;
