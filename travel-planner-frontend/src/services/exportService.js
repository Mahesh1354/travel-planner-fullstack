import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import html2canvas from 'html2canvas';
import { createEvent } from 'ics';

class ExportService {
  // Export trip as PDF
  async exportAsPDF(trip, destinations, activities) {
    // Validate required data
    if (!trip) {
      throw new Error('No trip data available');
    }

    const doc = new jsPDF();
    let yOffset = 20;
    const pageWidth = doc.internal.pageSize.width;
    const margin = 20;

    // Helper function to add new page if needed
    const checkPageBreak = (height) => {
      if (yOffset + height > doc.internal.pageSize.height - 20) {
        doc.addPage();
        yOffset = 20;
        return true;
      }
      return false;
    };

    // Helper function to safely format date
    const formatDateSafely = (dateString) => {
      if (!dateString) return 'N/A';
      try {
        return new Date(dateString).toLocaleDateString();
      } catch {
        return 'Invalid date';
      }
    };

    // Title
    doc.setFontSize(24);
    doc.setTextColor(2, 132, 199);
    doc.text(trip.title || 'Untitled Trip', margin, yOffset);
    yOffset += 10;

    // Trip dates
    if (trip.startDate || trip.endDate) {
      doc.setFontSize(12);
      doc.setTextColor(75, 85, 99);
      const dateText = `${formatDateSafely(trip.startDate)} - ${formatDateSafely(trip.endDate)}`;
      doc.text(dateText, margin, yOffset);
      yOffset += 8;
    }

    // Destination
    doc.text(`📍 ${trip.destination || 'No destination set'}`, margin, yOffset);
    yOffset += 15;

    // Description
    if (trip.description) {
      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55);
      const splitDesc = doc.splitTextToSize(trip.description, pageWidth - 2 * margin);
      doc.text(splitDesc, margin, yOffset);
      yOffset += splitDesc.length * 7 + 10;
    }

    // Budget section
    if (trip.budget && trip.budget > 0) {
      checkPageBreak(30);
      doc.setFontSize(16);
      doc.setTextColor(2, 132, 199);
      doc.text('Budget Overview', margin, yOffset);
      yOffset += 8;

      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55);
      doc.text(`Total Budget: $${trip.budget.toLocaleString()}`, margin + 5, yOffset);
      yOffset += 15;
    }

    // Destinations and Activities
    if (destinations && destinations.length > 0) {
      for (let index = 0; index < destinations.length; index++) {
        const dest = destinations[index];
        checkPageBreak(40);
        
        // Destination header
        doc.setFontSize(16);
        doc.setTextColor(2, 132, 199);
        doc.text(`${dest.name || 'Unknown'} (${dest.city || 'N/A'}, ${dest.country || 'N/A'})`, margin, yOffset);
        yOffset += 8;

        // Destination dates
        if (dest.arrivalDate || dest.departureDate) {
          doc.setFontSize(10);
          doc.setTextColor(75, 85, 99);
          doc.text(
            `${formatDateSafely(dest.arrivalDate)} - ${formatDateSafely(dest.departureDate)}`,
            margin + 5,
            yOffset
          );
          yOffset += 8;
        }

        // Accommodation
        if (dest.accommodationName) {
          doc.setFontSize(11);
          doc.setTextColor(31, 41, 55);
          doc.text(`🏨 ${dest.accommodationName}`, margin + 5, yOffset);
          yOffset += 6;
          
          if (dest.accommodationAddress) {
            doc.setFontSize(9);
            doc.setTextColor(107, 114, 128);
            doc.text(dest.accommodationAddress, margin + 10, yOffset);
            yOffset += 8;
          }
        }

        // Activities table
        const destActivities = activities?.filter(a => a.destinationId === dest.id) || [];
        
        if (destActivities.length > 0) {
          const tableData = destActivities.map(activity => [
            activity.time || activity.startTime || '--:--',
            activity.name || 'Unnamed activity',
            activity.type || 'N/A',
            activity.cost ? `$${activity.cost}` : '-',
            activity.completed ? '✓' : '○'
          ]);

          // Use autoTable with proper initialization
          try {
            doc.autoTable({
              startY: yOffset,
              head: [['Time', 'Activity', 'Type', 'Cost', 'Status']],
              body: tableData,
              margin: { left: margin + 5, right: margin },
              styles: { fontSize: 9, cellPadding: 3 },
              headStyles: { fillColor: [2, 132, 199], textColor: 255 },
              alternateRowStyles: { fillColor: [243, 244, 246] },
            });
            yOffset = doc.lastAutoTable.finalY + 10;
          } catch (error) {
            console.error('AutoTable error:', error);
            // Fallback to simple text if autoTable fails
            doc.setFontSize(10);
            doc.setTextColor(31, 41, 55);
            doc.text('Activities:', margin + 5, yOffset);
            yOffset += 6;
            
            destActivities.forEach((activity, idx) => {
              doc.setFontSize(9);
              doc.text(`${idx + 1}. ${activity.name || 'Activity'} - ${activity.cost ? `$${activity.cost}` : 'No cost'}`, margin + 10, yOffset);
              yOffset += 5;
            });
            yOffset += 5;
          }
        } else {
          doc.setFontSize(10);
          doc.setTextColor(107, 114, 128);
          doc.text('No activities planned', margin + 5, yOffset);
          yOffset += 15;
        }

        // Add separator between destinations
        if (index < destinations.length - 1) {
          doc.setDrawColor(229, 231, 235);
          doc.line(margin, yOffset - 5, pageWidth - margin, yOffset - 5);
        }
      }
    } else {
      // No destinations message
      doc.setFontSize(12);
      doc.setTextColor(107, 114, 128);
      doc.text('No destinations added to this trip.', margin, yOffset);
      yOffset += 15;
    }

    // Notes section
    if (trip.notes) {
      checkPageBreak(30);
      doc.setFontSize(16);
      doc.setTextColor(2, 132, 199);
      doc.text('Additional Notes', margin, yOffset);
      yOffset += 8;

      doc.setFontSize(10);
      doc.setTextColor(31, 41, 55);
      const splitNotes = doc.splitTextToSize(trip.notes, pageWidth - 2 * margin - 10);
      doc.text(splitNotes, margin + 5, yOffset);
      yOffset += splitNotes.length * 5 + 10;
    }

    return doc;
  }

  // Export itinerary as PDF
  async exportItineraryAsPDF(trip, activitiesByDay, days) {
    if (!trip) {
      throw new Error('No trip data available');
    }

    const doc = new jsPDF();
    let yOffset = 20;
    const margin = 20;

    // Helper function to format date safely
    const formatDateSafely = (date) => {
      if (!date) return 'N/A';
      try {
        return new Date(date).toLocaleDateString('en-US', { 
          weekday: 'long', 
          month: 'long', 
          day: 'numeric' 
        });
      } catch {
        return 'Invalid date';
      }
    };

    // Title
    doc.setFontSize(24);
    doc.setTextColor(2, 132, 199);
    doc.text(`${trip.title || 'Trip'} - Itinerary`, margin, yOffset);
    yOffset += 10;

    // Trip dates
    if (trip.startDate || trip.endDate) {
      doc.setFontSize(12);
      doc.setTextColor(75, 85, 99);
      doc.text(
        `${new Date(trip.startDate).toLocaleDateString()} - ${new Date(trip.endDate).toLocaleDateString()}`,
        margin,
        yOffset
      );
      yOffset += 15;
    }

    // Day by day itinerary
    if (days && days.length > 0) {
      for (const day of days) {
        // Check page break
        if (yOffset > doc.internal.pageSize.height - 40) {
          doc.addPage();
          yOffset = 20;
        }

        // Day header
        doc.setFontSize(16);
        doc.setTextColor(2, 132, 199);
        doc.text(`Day ${day.day} - ${formatDateSafely(day.date)}`, margin, yOffset);
        yOffset += 8;

        const dayActivities = activitiesByDay?.[day.day] || [];

        if (dayActivities.length === 0) {
          doc.setFontSize(10);
          doc.setTextColor(107, 114, 128);
          doc.text('No activities planned', margin + 5, yOffset);
          yOffset += 10;
        } else {
          // Sort activities by time
          const sortedActivities = [...dayActivities].sort((a, b) => {
            if (!a.startTime) return 1;
            if (!b.startTime) return -1;
            return a.startTime.localeCompare(b.startTime);
          });

          for (const activity of sortedActivities) {
            // Activity time
            if (activity.startTime) {
              doc.setFontSize(10);
              doc.setTextColor(2, 132, 199);
              doc.text(activity.startTime, margin + 5, yOffset);
            }

            // Activity name and details
            doc.setFontSize(11);
            doc.setTextColor(31, 41, 55);
            doc.text(activity.name || 'Unnamed activity', margin + 25, yOffset);
            yOffset += 5;

            // Location
            if (activity.location) {
              doc.setFontSize(9);
              doc.setTextColor(107, 114, 128);
              doc.text(`📍 ${activity.location}`, margin + 30, yOffset);
              yOffset += 4;
            }

            // Cost
            if (activity.cost) {
              doc.setFontSize(9);
              doc.setTextColor(107, 114, 128);
              doc.text(`💰 $${activity.cost}`, margin + 30, yOffset);
              yOffset += 4;
            }

            // Notes
            if (activity.notes) {
              doc.setFontSize(9);
              doc.setTextColor(75, 85, 99);
              const splitNotes = doc.splitTextToSize(activity.notes, 120);
              doc.text(splitNotes, margin + 30, yOffset);
              yOffset += splitNotes.length * 4 + 2;
            }

            yOffset += 3;
          }
        }

        yOffset += 5;
      }
    } else {
      doc.setFontSize(12);
      doc.setTextColor(107, 114, 128);
      doc.text('No itinerary days available.', margin, yOffset);
    }

    return doc;
  }

  // Create calendar events
  createCalendarEvent(trip, destinations) {
    if (!trip) return [];

    const events = [];

    // Helper function to safely parse date
    const parseDate = (dateString) => {
      if (!dateString) return null;
      try {
        return new Date(dateString);
      } catch {
        return null;
      }
    };

    // Main trip event
    const tripStart = parseDate(trip.startDate);
    const tripEnd = parseDate(trip.endDate);
    
    if (tripStart && tripEnd) {
      events.push({
        title: trip.title || 'Trip',
        description: trip.description || 'Trip planned with TravelPlanner',
        location: trip.destination || 'Unknown location',
        start: this.parseDateForICS(tripStart),
        end: this.parseDateForICS(tripEnd),
        url: window.location.href,
        organizer: { name: 'TravelPlanner' },
      });
    }

    // Destination events
    if (destinations && destinations.length > 0) {
      destinations.forEach(dest => {
        const destStart = parseDate(dest.arrivalDate);
        const destEnd = parseDate(dest.departureDate);
        
        if (destStart && destEnd) {
          events.push({
            title: `📍 ${dest.name || 'Destination'}`,
            description: `Destination: ${dest.city || 'N/A'}, ${dest.country || 'N/A'}\nAccommodation: ${dest.accommodationName || 'TBD'}`,
            location: dest.accommodationAddress || `${dest.city || ''}, ${dest.country || ''}`,
            start: this.parseDateForICS(destStart),
            end: this.parseDateForICS(destEnd),
            url: window.location.href,
          });
        }
      });
    }

    return events;
  }

  // Generate ICS file for calendar (supports multiple events)
  generateICSFile(events) {
    if (!events || events.length === 0) return null;

    if (events.length === 1) {
      const { error, value } = createEvent(events[0]);
      if (error) {
        console.error('Error creating calendar event:', error);
        return null;
      }
      return value;
    } else {
      // For multiple events, create a calendar with all events
      let icsContent = 'BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//TravelPlanner//EN\r\n';
      
      events.forEach(event => {
        const { error, value } = createEvent(event);
        if (!error && value) {
          // Remove the VCALENDAR wrapper from individual events
          const cleanedValue = value
            .replace('BEGIN:VCALENDAR\r\nVERSION:2.0\r\nPRODID:-//sebbo.net//ical-generator//EN\r\n', '')
            .replace('END:VCALENDAR', '');
          icsContent += cleanedValue;
        }
      });
      
      icsContent += 'END:VCALENDAR';
      return icsContent;
    }
  }

  // Helper to parse date for ICS format
  parseDateForICS(date) {
    if (!date) return null;
    try {
      const dateObj = date instanceof Date ? date : new Date(date);
      return [
        dateObj.getFullYear(),
        dateObj.getMonth() + 1,
        dateObj.getDate(),
        dateObj.getHours(),
        dateObj.getMinutes()
      ];
    } catch {
      return null;
    }
  }

  // Download PDF
  downloadPDF(doc, filename) {
    if (!doc) {
      console.error('No document to download');
      return;
    }
    const safeFilename = filename.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    doc.save(`${safeFilename}.pdf`);
  }

  // Download ICS file
  downloadICS(content, filename) {
    if (!content) {
      console.error('No content to download');
      return;
    }

    const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename.replace(/[^a-z0-9]/gi, '_').toLowerCase()}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  // Share trip link
  shareTripLink(tripId) {
    if (!tripId) {
      console.error('No trip ID provided');
      return 'Unable to share: No trip ID';
    }

    const url = `${window.location.origin}/trip/${tripId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Check out my trip!',
        text: 'I\'m planning this trip on TravelPlanner',
        url: url,
      }).catch(err => {
        console.error('Share failed:', err);
      });
    } else {
      navigator.clipboard.writeText(url).then(() => {
        // Success handled by caller
      }).catch(err => {
        console.error('Copy failed:', err);
        return 'Failed to copy link';
      });
      return 'Link copied to clipboard!';
    }
  }
}

export default new ExportService();